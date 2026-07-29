import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { DocumentList } from "@/components/document-list"
import { listDocumentsByUserId } from "@/lib/documents"

export default async function DocumentsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/")
  }

  const documents = await listDocumentsByUserId(session.user.id)

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <DocumentList initialDocuments={documents} />
    </main>
  )
}
