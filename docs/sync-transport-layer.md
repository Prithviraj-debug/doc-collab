# Sync / Transport Layer (Hocuspocus + Yjs)

## Overview

The sync / transport layer moves collaborative edits between browsers and durable storage.

It uses:

- **Yjs** — CRDT document model (conflict-free merges)
- **Hocuspocus** — WebSocket server and browser provider
- **IndexedDB** (`y-indexeddb`) — offline cache in the browser
- **Postgres** — append-only update log + snapshot compaction

Conflict merging stays with Yjs. Persistence only stores and replays binary updates.

For the full persistence design (schema, compaction rules, verification), see [`server/PERSISTENCE.md`](../server/PERSISTENCE.md).

---

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase (or other) Postgres with the document tables
- Collaboration server env: `server/.env`
- Next.js env: `NEXT_PUBLIC_HOCUSPOCUS_URL`

### Environment

**Server (`server/.env`):**

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:6543/postgres
PORT=1234
```

Encode `@` in passwords as `%40`.

**App (`app/.env.local`):**

```bash
NEXT_PUBLIC_HOCUSPOCUS_URL=ws://localhost:1234
```

In production, use a `wss://` URL for the deployed Hocuspocus host.

### Install and run

```bash
# Terminal 1 — collaboration server
cd server
npm install
npm start

# Terminal 2 — Next.js app
cd app
npm install
npm run dev
```

You should see:

```text
Postgres connected: ...
Hocuspocus listening on :1234
```

---

## How to Use

### Client connection

In `SimpleEditor`, each open document creates:

```ts
const ydoc = new Y.Doc()

const wsProvider = new HocuspocusProvider({
  url: process.env.NEXT_PUBLIC_HOCUSPOCUS_URL ?? "ws://localhost:1234",
  name: documentId, // room name = documents.id
  document: ydoc,
})

const indexDbProvider = new IndexeddbPersistence(`y-doc-${documentId}`, ydoc)
```

TipTap’s `Collaboration` extension binds to the same `ydoc`.

### Watch sync status

`app/hooks/use-sync-status.ts` listens to:

- Provider `status` → `offline` / `connecting` / `connected`
- Provider `synced` → clears pending changes, sets `lastSyncedAt`
- Yjs `update` events → marks local (non-remote) edits as pending

The workspace badge shows that state to the user.

### Room identity

Always use the Postgres document UUID as:

| Place | Value |
|-------|--------|
| Hocuspocus `name` | `documentId` |
| IndexedDB key | `y-doc-{documentId}` |
| `document_updates.document_id` | `documentId` |
| `document_snapshots.document_id` | `documentId` |

---

## Architecture Overview

```text
┌──────────────────────┐     WebSocket      ┌────────────────────┐
│  Browser             │ ◄────────────────► │  Hocuspocus        │
│  TipTap + Y.Doc      │   Yjs sync         │  server/server.js  │
│  IndexedDB cache     │                    └─────────┬──────────┘
└──────────────────────┘                              │
                                                      ▼
                                            ┌────────────────────┐
                                            │  persistence.js    │
                                            └─────────┬──────────┘
                                                      │
                                                      ▼
                                            ┌────────────────────┐
                                            │  Supabase Postgres │
                                            │  updates + snaps   │
                                            └────────────────────┘
```

### Files

| File | Role |
|------|------|
| `app/components/tiptap-templates/simple/simple-editor.tsx` | Provider + IndexedDB + TipTap Collaboration |
| `app/hooks/use-sync-status.ts` | Connection / pending-change UI state |
| `server/server.js` | Hocuspocus hooks, debounce, state vectors |
| `server/persistence.js` | Load, store, compact |
| `server/PERSISTENCE.md` | Deep persistence reference |

---

## Detailed Concepts

### Load (`onLoadDocument`)

When the first client joins a room:

1. Read the latest snapshot for `document_id`
2. Read updates with `id > last_update_id`
3. Apply snapshot, then updates, onto the in-memory `Y.Doc`
4. Remember the document’s state vector for incremental stores

### Store (`onStoreDocument`)

Debounced (2s, max 10s) after edits:

1. Encode only changes since the last stored state vector
2. Append that binary blob to `document_updates`
3. Update the in-memory state vector
4. Touch `documents.updated_at` for UUID rooms
5. Compact if the update count is high enough

Empty / no-op updates (≤ 2 bytes) are skipped.

### Compact

Runs when:

- Update count reaches **100**, or
- The **last client disconnects** and updates remain

Compaction folds the live `Y.Doc` into one snapshot and deletes covered log rows.

Compaction snapshots are a **storage optimization**. They are not user-facing named versions.

### Safety limits

| Guard | Value | Why |
|-------|-------|-----|
| Max update size | 1 MiB | Reject oversized payloads |
| Store debounce | 2–10 s | Avoid a write per keystroke |
| Compaction threshold | 100 | Bound log growth |

### Local vs remote updates

Yjs tags each update with an `origin`.

Remote updates that arrived through the Hocuspocus provider use that provider as origin. Local typing does not. `useSyncStatus` uses that difference to set `hasPendingChanges`.

---

## Examples and Practical Scenarios

### Fresh browser loads a shared doc

1. IndexedDB is empty.
2. Provider connects to Hocuspocus with `name = documentId`.
3. Server loads snapshot ⊕ updates from Postgres.
4. Client receives the synced state and TipTap renders it.

### Rapid typing

1. Each keystroke updates the local `Y.Doc`.
2. Provider sends updates over the WebSocket.
3. Server waits (debounce) then appends an incremental binary update.
4. Peers apply the update and see the text converge.

### Server restart

1. In-memory rooms are gone.
2. Next client join reloads from Postgres.
3. Clients with IndexedDB can still work offline; they reconverge on reconnect.

---

## Advanced Topics

### Auth on the WebSocket (TODO)

HTTP document pages already check `document_members`. The Hocuspocus socket does not yet enforce `onAuthenticate`.

Planned work:

- Pass a session / JWT token from the provider
- Implement `onAuthenticate` on the server
- Enforce owner / editor / viewer roles
- Fill `document_updates.user_id` from the auth context
- Block viewers from persisting writable updates

### Horizontal scaling

One Hocuspocus node is enough for the current setup.

Multiple nodes need shared doc transport (for example Redis) and careful compaction locking per `document_id`.

### Crash window

Debounced store means a few seconds of edits may exist only in memory and on clients. IndexedDB covers local durability. Flush-on-disconnect and compaction on empty rooms reduce risk.

### Named versions vs compaction

| Concept | Purpose | Deleted by compaction? |
|---------|---------|------------------------|
| Compaction snapshot | Keep the log small | Replaced / optimized by system |
| Named version / Save | User history / restore | No — must use a separate table |

---

## Quick Reference

```text
Load:    snapshot + updates(id > last_update_id) → Y.applyUpdate
Store:   encodeStateAsUpdate(doc, lastVector) → INSERT document_updates
Compact: encodeStateAsUpdate(doc) → upsert snapshot, DELETE updates id <= max
```

---

## Related docs

- [`server/PERSISTENCE.md`](../server/PERSISTENCE.md) — schema and verification steps
- [Editor layer](./editor-layer.md)
- [Auth layer](./auth-layer.md)
