import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { getDocumentForUser } from "@/lib/documents"
import { AppNavbar } from "@/components/app-navbar"
import { DocumentBreadcrumb } from "@/components/document-breadcrumb"
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
      <AppNavbar
        user={session.user}
        center={
          <DocumentBreadcrumb
            documentId={document.id}
            title={document.title}
          />
        }
        actions={<InviteUser documentId={document.id} />}
      />

      <main id="main-content" className="min-h-0 flex-1" tabIndex={-1}>
        <SimpleEditor documentId={document.id} user={session.user} />
      </main>
    </div>
  )
}
