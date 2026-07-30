# DocCollab Documentation

This folder explains the main layers of the real-time collaborative document editor.

Each layer has a clear job. Keep them separate so changes stay easier to reason about.

| Layer | Doc | Job |
|-------|-----|-----|
| Editor | [editor-layer.md](./editor-layer.md) | TipTap rich-text editing, toolbar, carets, PDF export |
| Sync / transport | [sync-transport-layer.md](./sync-transport-layer.md) | Yjs + Hocuspocus WebSocket sync, IndexedDB, Postgres persistence |
| Auth | [auth-layer.md](./auth-layer.md) | Auth.js sessions, Google sign-in, document membership |
| AI | [ai-layer.md](./ai-layer.md) | Chat UI, document context, Gemini streaming |

For the deep persistence design (update log + compaction), see also [`server/PERSISTENCE.md`](../server/PERSISTENCE.md).

## High-level flow

```text
Browser
  ├── TipTap editor (edits document)
  ├── Yjs + IndexedDB (local CRDT + offline)
  ├── Hocuspocus provider (WebSocket sync)
  ├── Auth.js session (who is the user)
  └── AI chat (asks Gemini about current HTML)

Next.js app
  ├── Auth routes + document membership checks
  └── /api/chat (streams AI replies)

Hocuspocus server
  └── Load / store / compact Yjs updates in Postgres
```

## Suggested reading order

1. [Auth](./auth-layer.md) — how users get into the app
2. [Editor](./editor-layer.md) — what users type into
3. [Sync / transport](./sync-transport-layer.md) — how edits reach other people and the database
4. [AI](./ai-layer.md) — how the assistant uses document context


## Other repos

Check out sync layer - [https://github.com/Prithviraj-debug/doc-collab-ws]