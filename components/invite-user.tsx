"use client"

import { inviteToDocumentAction } from "@/actions/invite"
import { useEffect, useId, useRef, useState } from "react"

const ROLE_OPTIONS = [
  {
    value: "editor",
    label: "Editor",
    description: "Can write and edit content",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Can read, but not change the doc",
  },
] as const

type Role = (typeof ROLE_OPTIONS)[number]["value"]

const InviteUser = ({ documentId }: { documentId: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("editor")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const titleId = useId()
  const descriptionId = useId()
  const emailRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
      emailRef.current?.focus()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  const close = () => {
    setIsOpen(false)
    setSubmitted(false)
    setError(null)
    setIsSubmitting(false)
    setEmail("")
    setRole("editor")
  }

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || isSubmitting) return

    setError(null)
    setIsSubmitting(true)
    try {
      const result = await inviteToDocumentAction(documentId, trimmed, role)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-sm font-medium text-neutral-800 transition hover:border-teal-700/30 hover:bg-teal-50 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/20"
      >
        <InviteIcon />
        <span className="hidden sm:inline">Invite</span>
        <span className="sr-only sm:hidden">Invite collaborator</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={close}
        className="invite-dialog fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border border-neutral-200/80 bg-[#f7f8fa] p-0 text-neutral-900 shadow-[0_24px_60px_-28px_rgba(22,22,26,0.45)] open:flex open:flex-col backdrop:bg-neutral-950/40 backdrop:backdrop-blur-[2px]"
      >
        <div className="border-b border-neutral-200/80 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
                Share access
              </p>
              <h2
                id={titleId}
                className="mt-1 text-xl font-semibold tracking-tight text-neutral-900"
              >
                Invite someone
              </h2>
              <p
                id={descriptionId}
                className="mt-1 text-sm leading-relaxed text-neutral-500"
              >
                Send this document to a teammate by email and choose what they
                can do.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="space-y-4 px-5 py-6">
            <div className="rounded-xl border border-teal-700/15 bg-teal-50 px-4 py-3">
              <p className="text-sm font-medium text-teal-950">
                Invitation ready
              </p>
              <p className="mt-1 text-sm leading-relaxed text-teal-900/80">
                <span className="font-medium">{email.trim()}</span> will join as{" "}
                {role === "editor" ? "an editor" : "a viewer"}.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  setError(null)
                  setEmail("")
                  setRole("editor")
                  queueMicrotask(() => emailRef.current?.focus())
                }}
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                Invite another
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-md bg-teal-800 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-teal-900"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
            <div className="space-y-1.5">
              <label
                htmlFor="invite-email"
                className="block text-sm font-medium text-neutral-800"
              >
                Email address
              </label>
              <input
                ref={emailRef}
                id="invite-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (error) setError(null)
                }}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-teal-700/40 focus:ring-2 focus:ring-teal-700/15"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-neutral-800">
                Permission
              </legend>
              <div className="grid gap-2">
                {ROLE_OPTIONS.map((option) => {
                  const selected = role === option.value
                  const optionId = `invite-role-${option.value}`
                  return (
                    <label
                      key={option.value}
                      htmlFor={optionId}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition ${
                        selected
                          ? "border-teal-700/35 bg-white ring-2 ring-teal-700/10"
                          : "border-neutral-200 bg-white/70 hover:border-neutral-300"
                      }`}
                    >
                      <input
                        id={optionId}
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={selected}
                        onChange={() => setRole(option.value)}
                        aria-describedby={`${optionId}-desc`}
                        className="mt-1 size-4 accent-teal-800"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-neutral-900">
                          {option.label}
                        </span>
                        <span
                          id={`${optionId}-desc`}
                          className="mt-0.5 block text-sm text-neutral-500"
                        >
                          {option.description}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              >
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-neutral-200/80 pt-4">
              <button
                type="button"
                onClick={close}
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-teal-800 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending…" : "Send invite"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  )
}

function InviteIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-current"
    >
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M19 8v6M22 11h-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default InviteUser
