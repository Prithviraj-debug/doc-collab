import Link from "next/link"
import { DocumentTitle } from "@/components/document-title"

export function DocumentBreadcrumb({
  documentId,
  title,
}: {
  documentId: string
  title: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
      <Link
        href="/documents"
        className="hidden shrink-0 rounded-md px-1.5 py-1 text-sm text-neutral-500 outline-none transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-teal-700/25 sm:inline"
      >
        Documents
      </Link>
      <Link
        href="/documents"
        aria-label="Back to documents"
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-neutral-500 outline-none transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-teal-700/25 sm:hidden"
      >
        <BackIcon />
      </Link>
      <span className="hidden text-neutral-300 sm:inline" aria-hidden="true">
        /
      </span>
      <DocumentTitle documentId={documentId} initialTitle={title} />
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 18 9 12l6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
