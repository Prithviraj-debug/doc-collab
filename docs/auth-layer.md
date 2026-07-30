# Auth Layer (Auth.js + Google)

## Overview

The auth layer answers: **who is signed in**, and **which documents they may open**.

It uses:

- **Auth.js** (`next-auth` v5) for sessions
- **Google** as the OAuth provider
- **Postgres adapter** (`@auth/pg-adapter`) for users, accounts, and sessions
- **`document_members`** for per-document roles

Sign-in is required for document routes. Collaboration carets and invites use the signed-in user id.

---

## Getting Started

### Environment

Set these in `app/.env.local` (never commit real secrets):

```bash
AUTH_SECRET=...                 # random secret for Auth.js
AUTH_GOOGLE_ID=...              # Google OAuth client id
AUTH_GOOGLE_SECRET=...          # Google OAuth client secret

DATABASE_HOST=...
DATABASE_USER=...
DATABASE_PASSWORD=...
DATABASE_NAME=...
```

`auth.ts` builds a `pg` pool from the discrete `DATABASE_*` fields (not `DATABASE_URL`).

### Google Cloud setup

1. Create an OAuth client in Google Cloud Console.
2. Add authorized redirect URI for Auth.js, for example:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://YOUR_DOMAIN/api/auth/callback/google`
3. Copy client id and secret into env vars above.

### Install and run

```bash
cd app
npm install
npm run dev
```

Open `/` and use **Sign in**. After Google consent, Auth.js creates/updates the user row via the Postgres adapter.

---

## How to Use

### Sign in (UI)

`app/components/auth.tsx` is a server component:

- If a session exists → render `UserMenu`
- Otherwise → form that calls `signIn("google", { redirectTo })`

Default redirect after sign-in is `/documents`.

### Sign out

`app/actions/auth.ts` exposes `signOutAction()`, which calls Auth.js `signOut`.

The user menu triggers that action.

### Protect a document page

```ts
const session = await auth()
if (!session?.user?.id) {
  redirect("/")
}

const document = await getDocumentForUser(id, session.user.id)
if (!document) {
  notFound()
}
```

Membership is checked in SQL (`documents` ⋈ `document_members`). No membership → 404.

### Invite another user

Owners and editors can invite by email through `InviteUser` → `inviteToDocumentAction`.

Rules:

- Invitee must already have a row in Auth.js `users` (they must sign in once first)
- Role must be `viewer` or `editor`
- Inviter must be `owner` or `editor` on that document
- Duplicate membership is rejected

---

## Architecture Overview

```text
Browser
  └── Sign in with Google
        │
        ▼
/api/auth/[...nextauth]   ← Auth.js handlers
        │
        ▼
Postgres (Auth.js tables)
  users / accounts / sessions / ...

Document access
  auth() → session.user.id
        → document_members (role)
        → allow list / create / invite
```

### Files

| File | Role |
|------|------|
| `app/auth.ts` | NextAuth config: Google provider, Postgres adapter, session callback |
| `app/app/api/auth/[...nextauth]/route.ts` | Auth HTTP handlers (`GET` / `POST`) |
| `app/types/next-auth.d.ts` | Extends `Session.user` with `id` |
| `app/components/auth.tsx` | Sign-in / user menu entry |
| `app/actions/auth.ts` | Sign-out server action |
| `app/actions/invite.ts` | Invite server action (session-gated) |
| `app/lib/documents.ts` | Membership queries, create owner, invite by email |
| `app/proxy.ts` | Redirects unauthenticated `/documents/*` visitors to `/` |

---

## Detailed Concepts

### Auth.js config

```ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PostgresAdapter(pool),
  providers: [Google],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = String(user.id)
      }
      return session
    },
  },
})
```

The session callback is important. Server Components and route handlers need `session.user.id` for membership checks and collaboration identity.

### Session user shape

```ts
session.user = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}
```

Declared in `app/types/next-auth.d.ts`.

### Document roles

Stored in `document_members`:

| Role | Typical powers today |
|------|----------------------|
| `owner` | Created the doc; can invite; full access in app UI |
| `editor` | Can open and edit; can invite |
| `viewer` | Intended read-only (HTTP membership yes; WS write enforcement still TODO) |

`createDocument(title, userId)` inserts the document and an `owner` membership in one transaction. That avoids orphaned documents.

### Route protection layers

1. **`proxy.ts`** — if there is no session and the path starts with `/documents`, redirect to `/`.
2. **Page / action checks** — call `auth()` again and verify `document_members` before reading or mutating.

Always keep the membership check on sensitive operations. A redirect alone is not enough for server actions and APIs.

### Collaboration identity

The editor receives the Auth.js user and builds a caret identity:

- Display name from `name` or `email`
- Stable color from `user.id` (`colorFromUserId`)

That is awareness metadata only. It is not yet a Hocuspocus auth token.

---

## Examples and Practical Scenarios

### New user creates a document

1. User signs in with Google.
2. Auth.js upserts `users` / `accounts`.
3. User creates a document → row in `documents` + `document_members` role `owner`.
4. User is redirected to `/documents/{id}` and can edit.

### Invite a teammate

1. Owner opens **Invite** and enters an email + role.
2. Server looks up `users` by email (case-insensitive).
3. If found and not already a member, inserts `document_members`.
4. Teammate signs in (same Google email) and sees the doc in their list.

### Signed-out visitor

1. Hits `/documents` or `/documents/{id}`.
2. Proxy / page redirects to `/`.
3. After Google sign-in, they only see documents they belong to.

---

## Advanced Topics

### What Auth.js stores vs what the app stores

| Concern | Where |
|---------|--------|
| Identity (email, OAuth account, session cookie) | Auth.js adapter tables |
| Which docs a user can open | `document_members` |
| Yjs binary content | `document_updates` / `document_snapshots` |

Do not treat Auth.js tables as the document ACL. Keep membership explicit.

### Hocuspocus authentication (TODO)

HTTP access control does not automatically secure the WebSocket.

Still needed:

- Provider token / cookie validation in `onAuthenticate`
- Role-aware write permissions
- Persist `user_id` on each stored update

See [sync / transport layer](./sync-transport-layer.md).

### Images from Google

`next.config.ts` allows `lh3.googleusercontent.com` so profile avatars can load in `next/image` / UI.

### Security notes

- Never commit `.env.local` or real OAuth secrets.
- Prefer membership checks in server code (`auth()` + SQL), not only client UI hiding.
- Invite by email only works for users who already signed in once (existing `users` row).

---

## Related docs

- [Editor layer](./editor-layer.md) — uses session user for carets
- [Sync / transport layer](./sync-transport-layer.md) — future WS auth
- [AI layer](./ai-layer.md) — chat receives user display name
