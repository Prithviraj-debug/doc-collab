# Editor Layer (TipTap)

## Overview

The editor layer is the rich-text surface users type into.

It uses **TipTap** (built on ProseMirror) with collaboration extensions so many people can edit the same document at once.

This layer owns:

- Editor setup and extensions
- Formatting toolbar
- Collaboration carets (who is typing where)
- PDF download
- Wiring the AI chat into the editor context

It does **not** own durable storage. Sync and persistence live in the [sync / transport layer](./sync-transport-layer.md).

---

## Getting Started

### Main entry

| File | Role |
|------|------|
| `app/components/tiptap-templates/simple/simple-editor.tsx` | Creates the TipTap editor, Yjs doc, and Hocuspocus provider |
| `app/components/document-workspace.tsx` | Page shell: navbar, sync badge, history, invite, editor |
| `app/app/documents/[id]/page.tsx` | Server page that loads membership + mounts the workspace |

### Run the app

```bash
cd app
npm install
npm run dev
```

Open a document at `/documents/[id]` while signed in.

---

## How to Use

### Open a document

1. Sign in with Google.
2. Open or create a document from `/documents`.
3. The workspace mounts `SimpleEditor` with:
   - `documentId` — Postgres UUID and collaboration room name
   - `user` — id, name, email for carets and chat

### Format text

Use the toolbar for:

- Undo / redo
- Headings (H1–H4)
- Bullet, ordered, and task lists
- Blockquote and code block
- Bold, italic, strike, code, underline
- Highlight and links
- Superscript / subscript
- Text align
- Image upload

On small screens, highlight and link open a secondary mobile toolbar.

### Download as PDF

The navbar **Download** button calls a callback registered by the editor.

The editor builds a PDF with `jspdf` from `editor.getHTML()`.

### Keyboard save (local stub)

`Ctrl/Cmd + S` runs a local save helper.

Today it encodes a Yjs update and shows an alert. Named version snapshots are not wired yet.

---

## Architecture Overview

```text
DocumentWorkspace
  └── SimpleEditor
        ├── Y.Doc (one per document open)
        ├── HocuspocusProvider (sync)
        ├── IndexeddbPersistence (offline cache)
        ├── useEditor(...)  → TipTap instance
        ├── Toolbar + EditorContent
        └── Chat (AI panel, same EditorContext)
```

### Key ideas

**Y.Doc** is the shared CRDT document. TipTap does not store the “source of truth” as HTML for collaboration. Collaboration reads and writes through Yjs.

**Room name** equals `documentId`. That same id is used for:

- Hocuspocus room name
- IndexedDB key `y-doc-{documentId}`
- Postgres `documents.id`

**EditorContext** from `@tiptap/react` lets child UI (toolbar buttons, AI chat) call `useCurrentEditor()` without prop drilling.

---

## Detailed Concepts

### Extensions

Configured in `useEditor({ extensions: [...] })`:

| Extension | Purpose |
|-----------|---------|
| `StarterKit` | Core nodes/marks (paragraphs, lists, bold, etc.). Horizontal rule and default link behavior customized. |
| `Collaboration` | Binds TipTap to the `Y.Doc` |
| `CollaborationCaret` | Remote cursors / name labels via provider awareness |
| `HorizontalRule` | Custom HR node |
| `TextAlign` | Align headings and paragraphs |
| `TaskList` / `TaskItem` | Checkable lists |
| `Highlight` | Multicolor highlights |
| `Image` + `ImageUploadNode` | Images and upload UI |
| `Typography` | Typographic replacements |
| `Superscript` / `Subscript` | Super/sub marks |
| `Selection` | Selection decoration helpers |

Order matters: register `Collaboration` before `CollaborationCaret` so the Yjs sync plugin exists when caret decorations are created.

### Collaboration user

```ts
{
  name: user.name || user.email || "Anonymous",
  color: colorFromUserId(user.id),
}
```

Colors come from `app/lib/collaboration-user.ts`. The same user id always maps to the same pastel color.

Awareness is refreshed with `editor.commands.updateUser(...)` if the display name changes.

### Lifecycle

On mount:

1. Create `Y.Doc`
2. Create `HocuspocusProvider` and optional `IndexeddbPersistence`
3. Create the TipTap editor
4. Report sync status upward to the workspace badge

On unmount:

1. Destroy the provider
2. Destroy IndexedDB persistence
3. Destroy the `Y.Doc`

`immediatelyRender: false` avoids SSR/client hydration mismatches for the editor.

### Sync status surface

`useSyncStatus` tracks:

- `connectionState`: `offline` | `connecting` | `syncing` | `connected`
- `hasPendingChanges`: local edits not yet confirmed synced

The workspace shows a connection badge from those values.

### UI building blocks

Under `app/components/`:

- `tiptap-ui/` — toolbar buttons (heading, list, mark, align, …)
- `tiptap-ui-primitive/` — button, toolbar, popover, tooltip, …
- `tiptap-node/` — node styles and custom nodes
- `tiptap-icons/` — SVG icons

Keep formatting logic in those hooks/components. Keep `simple-editor.tsx` focused on wiring.

---

## Examples and Practical Scenarios

### Two people edit the same doc

1. Both open `/documents/{same-id}`.
2. Each browser creates its own TipTap instance on the **same** Yjs room name.
3. Hocuspocus merges updates.
4. Each sees the other’s caret color and name.

### Offline then online

1. IndexedDB keeps a local copy under `y-doc-{id}`.
2. Edits still apply to the local `Y.Doc`.
3. When the WebSocket reconnects, pending updates sync to the server and peers.

### AI reads the editor

The chat panel calls `editor.getHTML()` and sends it as `docText` with each message. See [AI layer](./ai-layer.md).

---

## Advanced Topics

### Do not make HTML the collaboration source of truth

HTML is fine for:

- AI context
- PDF export
- Display / sanitize in chat

For sync, always use binary Yjs updates. Rebuilding a shared doc from HTML can duplicate content and break CRDT merges.

### Named versions (TODO)

`Ctrl/Cmd + S` already encodes `Y.encodeStateAsUpdate(ydoc)`. A future “Save version” feature should store that blob in a **separate** versions table, not in compaction snapshots.

### Adding an extension

1. Install / import the TipTap extension.
2. Add it to the `extensions` array in `SimpleEditor`.
3. Add a toolbar control under `tiptap-ui/` if users need a button.
4. Confirm it works with `Collaboration` (most node extensions do; custom plugins need care).

---

## Related docs

- [Sync / transport layer](./sync-transport-layer.md)
- [AI layer](./ai-layer.md)
- [Auth layer](./auth-layer.md)
