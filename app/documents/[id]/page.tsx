import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { getDocumentForUser } from "@/lib/documents"
import { DocumentTitle } from "@/components/document-title"
import Auth from "@/components/auth"
import InviteUser from "@/components/invite-user"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function DocumentPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/")
  }

  const { id } = await params
  const document = await getDocumentForUser(id, session.user.id)

  if (!document) {
    notFound()
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-3 py-2 text-neutral-900">
        <Link
          href="/documents"
          className="rounded px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
        >
          All documents
        </Link>
        <span className="text-neutral-300" aria-hidden>
          /
        </span>
        <DocumentTitle documentId={document.id} initialTitle={document.title} />
        <div className="ml-auto flex items-center gap-2">
          <InviteUser documentId={document.id} />
          <Auth />
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <SimpleEditor documentId={document.id} />
      </div>
    </div>
  )
}
