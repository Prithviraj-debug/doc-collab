"use server"

import { auth } from "@/auth"
import {
  InviteError,
  inviteUserToDocumentByEmail,
  type InviteRole,
} from "@/lib/documents"

export type InviteActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function inviteToDocumentAction(
  documentId: string,
  email: string,
  role: InviteRole
): Promise<InviteActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in to invite people." }
  }

  const trimmedEmail = email.trim()
  if (!trimmedEmail) {
    return { ok: false, error: "Enter an email address." }
  }

  try {
    await inviteUserToDocumentByEmail(
      documentId,
      session.user.id,
      trimmedEmail,
      role
    )
    return { ok: true }
  } catch (error) {
    if (error instanceof InviteError) {
      return { ok: false, error: error.message }
    }
    console.error("inviteToDocumentAction failed:", error)
    return { ok: false, error: "Could not send the invite. Try again." }
  }
}
