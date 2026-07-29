import Link from "next/link"

export default function DocumentNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold text-neutral-900">
        Document not found
      </h1>
      <p className="text-neutral-600">
        This document does not exist or was removed.
      </p>
      <Link
        href="/"
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
      >
        Back to documents
      </Link>
    </main>
  )
}
