import Link from "next/link"
import { notFound } from "next/navigation"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { getDocument, getHistory } from "@/lib/documents"
import { DocumentTitle } from "@/components/document-title"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params
  const document = await getDocument(id)
  const history = await getHistory(id)
  console.log(history)
  if (!document) {
    notFound()
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden text-neutral-900">
      <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-3 py-2">
        <Link
          href="/"
          className="rounded px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
        >
          All documents
        </Link>
        <span className="text-neutral-300" aria-hidden>
          /
        </span>
        <DocumentTitle documentId={document.id} initialTitle={document.title} />
        {/* <DocHistory history={history} /> */}
      </div>

      <div className="min-h-0 flex-1">
        <SimpleEditor documentId={document.id} />
      </div>
    </div>
  )
}
