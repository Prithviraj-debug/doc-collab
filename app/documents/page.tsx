import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AppNavbar } from "@/components/app-navbar"
import { DocumentList } from "@/components/document-list"
import { listDocumentsByUserId } from "@/lib/documents"

export default async function DocumentsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/")
  }

  const documents = await listDocumentsByUserId(session.user.id)

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <AppNavbar user={session.user} />
      <main id="main-content" tabIndex={-1}>
        <DocumentList initialDocuments={documents} />
      </main>
    </div>
  )
}
