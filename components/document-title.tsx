"use client"

import { useEffect, useState } from "react"

export function DocumentTitle({
  documentId,
  initialTitle,
}: {
  documentId: string
  initialTitle: string
}) {
  const [title, setTitle] = useState(initialTitle)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTitle(initialTitle)
  }, [initialTitle])

  useEffect(() => {
    if (title === initialTitle) return

    const handle = window.setTimeout(async () => {
      setSaving(true)
      try {
        await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        })
      } finally {
        setSaving(false)
      }
    }, 600)

    return () => window.clearTimeout(handle)
  }, [title, initialTitle, documentId])

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <label htmlFor="document-title" className="sr-only">
        Document title
      </label>
      <input
        id="document-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent text-sm font-medium text-neutral-900 outline-none focus:ring-0"
        placeholder="Untitled"
      />
      {saving && (
        <span className="shrink-0 text-xs text-neutral-400">Saving…</span>
      )}
    </div>
  )
}
