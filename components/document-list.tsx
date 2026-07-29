"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import type { DocumentRow } from "@/lib/documents"

function formatUpdatedAt(value: string) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

export function DocumentList({
  initialDocuments,
}: {
  initialDocuments: DocumentRow[]
}) {
  const router = useRouter()
  const [documents, setDocuments] = useState(initialDocuments)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const createDocument = () => {
    setError(null)
    startTransition(async () => {
      try {
        const response = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Untitled" }),
        })

        if (!response.ok) {
          throw new Error("Could not create document")
        }

        const data = (await response.json()) as { document: DocumentRow }
        setDocuments((prev) => [data.document, ...prev])
        router.push(`/documents/${data.document.id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Create failed")
      }
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase">
            DocCollab
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900">
            Documents
          </h1>
          <p className="mt-2 text-neutral-600">
            Local-first collaborative editing with background sync.
          </p>
        </div>

        <button
          type="button"
          onClick={createDocument}
          disabled={isPending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Creating…" : "New document"}
        </button>
      </header>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {documents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 px-6 py-16 text-center text-neutral-500">
          No documents yet. Create one to start editing offline-first.
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
          {documents.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                className="flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-none"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-neutral-900">
                    {doc.title}
                  </p>
                  <p className="mt-1 truncate font-mono text-xs text-neutral-400">
                    {doc.id}
                  </p>
                </div>
                <time
                  dateTime={doc.updated_at}
                  className="shrink-0 text-sm text-neutral-500"
                >
                  {formatUpdatedAt(doc.updated_at)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
