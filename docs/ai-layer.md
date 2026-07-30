# AI Layer (Chat, Instructions, Context)

## Overview

The AI layer helps users ask questions about the document they are editing.

It uses:

- **Vercel AI SDK** (`ai`, `@ai-sdk/react`) for streaming chat
- **Google Gemini** via `@ai-sdk/google`
- **Current TipTap HTML** as document context on each request
- **DOMPurify** to sanitize HTML replies before rendering

The assistant suggests improvements, answers questions, and looks for grammar / clarity issues. It returns HTML so the UI can show formatted answers.

Today the AI **does not write back into the Yjs document**. Replies stay in the chat panel unless the user copies them manually.

---

## Getting Started

### Environment

In `app/.env.local`:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=...
```

The Google provider in the AI SDK reads this key automatically.

### Install and run

```bash
cd app
npm install
npm run dev
```

Open a document, click **Ask AI**, and send a message.

### Main files

| File | Role |
|------|------|
| `app/components/ai-chat.tsx` | Chat UI, suggestions, streaming display |
| `app/app/api/chat/route.ts` | Server route: instructions, model, stream response |
| `app/components/tiptap-templates/simple/simple-editor.tsx` | Mounts `<Chat />` inside `EditorContext` |

---

## How to Use

### Open the assistant

1. Open any document you can access.
2. Click **Ask AI** (bottom-right).
3. Pick a suggestion or type a question.
4. Press Enter / Send. Press Escape or the close button to dismiss.

While the model streams, the send button becomes **Stop**.

### What the model receives

Each send includes:

| Field | Source | Purpose |
|-------|--------|---------|
| `messages` | `useChat` history | Conversation turns |
| `docText` | `editor.getHTML()` | Current document body as HTML |
| `documentId` | prop | Sent in the body for future use (room / logging); route primarily uses `docText` |

### Suggested prompts

Hard-coded in the empty state:

- “What can you help me with?”
- “What is the main idea of the document?”

Add more entries to the `SUGGESTIONS` array in `ai-chat.tsx` as needed.

---

## Architecture Overview

```text
Chat UI (ai-chat.tsx)
  useChat() ──POST──► /api/chat
                         │
                         ├── convertToModelMessages(messages)
                         ├── instructions + docText
                         └── streamText(google("gemini-3.5-flash-lite"))
                         │
                         ◄── UI message stream ──
  sanitize HTML with DOMPurify
  render assistant parts as HTML
```

The chat component sits under TipTap’s `EditorContext.Provider`, so it can call `useCurrentEditor()` and read live HTML without a separate store.

---

## Detailed Concepts

### Client: `useChat`

```ts
const { messages, sendMessage, status, stop } = useChat()

sendMessage(
  { text: trimmed },
  { body: { documentId, docText: editor?.getHTML() } }
)
```

- `status` is `submitted` or `streaming` while busy.
- User parts render as plain text.
- Assistant text parts render as sanitized HTML (`dangerouslySetInnerHTML` after DOMPurify).

### Server: instructions and model

`POST /api/chat`:

```ts
const { messages, docText } = await req.json()

const result = streamText({
  model: google("gemini-3.5-flash-lite"),
  instructions: `You are a helpful assistant ... ALWAYS return your response in HTML format. The current document text is: ${docText}.`,
  messages: await convertToModelMessages(messages),
})

return createUIMessageStreamResponse({
  stream: toUIMessageStream({ stream: result.stream }),
})
```

**Instructions** tell the model:

- It helps with collaborative document editing
- It should suggest readability improvements
- It should use the most relevant parts of the document
- It should help with grammar, spelling, and punctuation
- It must answer in **HTML**

**Context** is the full `docText` string embedded in those instructions on every request.

### Streaming response shape

The route returns a UI message stream compatible with `@ai-sdk/react` `useChat`.

The client appends assistant message parts as they arrive and scrolls to the latest message.

### Safety: HTML replies

Because the model is instructed to return HTML:

1. Never inject raw model output into the DOM.
2. Always run `dompurify.sanitize(part.text)` first.
3. Keep user messages as text nodes (no HTML interpretation).

### Greeting

The empty state uses the first name from `user.name` (Auth.js session), or `"there"`.

---

## Examples and Practical Scenarios

### Ask about document meaning

1. User opens a long doc and clicks **Ask AI**.
2. Chooses “What is the main idea of the document?”
3. Client sends the full current HTML as `docText`.
4. Gemini streams an HTML summary.
5. UI sanitizes and renders lists / paragraphs.

### Grammar pass

1. User types: “Find grammar and punctuation issues.”
2. Model uses `docText` from instructions.
3. Reply lists issues in HTML (`<ul>`, `<p>`, …).

### Busy / stop

1. While `status` is streaming, input is disabled.
2. User clicks Stop → `stop()` cancels the stream.
3. Input becomes editable again.

---

## Advanced Topics

### Keep AI output out of the CRDT by default

Silent model writes into Yjs can surprise collaborators and are hard to undo.

Safer patterns:

1. Show suggestions in chat (current behavior).
2. Let the user accept a patch / insert selected HTML.
3. Optionally store accepted edits as normal local TipTap transactions (then sync via Yjs).

### Context size

Large documents make `docText` large. That increases cost and can hit model limits.

Future improvements:

- Send plain text instead of full HTML
- Send only the current selection or nearby headings
- Summarize long docs server-side before the main answer
- Cap `docText` length with a clear truncation notice

### Auth on `/api/chat` (recommended)

The chat route does not currently require a session.

Hardening ideas:

- Call `auth()` and reject anonymous callers
- Confirm `documentId` membership before answering
- Avoid trusting client-only identity fields

### Changing the model

Update the model id in `app/app/api/chat/route.ts`:

```ts
model: google("gemini-3.5-flash-lite")
```

Keep the HTML instruction and sanitizer in sync if you change response format.

### Customizing instructions

Edit the `instructions` string in the chat route.

Keep instructions short and explicit:

- Role (document assistant)
- Allowed tasks
- Required output format (HTML today)
- Where document context lives (`docText`)

Avoid stuffing secrets or private system notes into instructions that get logged.

### Persistence of chat history

`useChat` keeps messages in client memory for the open panel session.

There is no server-side chat transcript table yet. Refreshing the page clears the thread.

---

## Related docs

- [Editor layer](./editor-layer.md) — TipTap HTML source for `docText`
- [Auth layer](./auth-layer.md) — user name shown in the greeting
- [Sync / transport layer](./sync-transport-layer.md) — why AI should not overwrite Yjs blindly
