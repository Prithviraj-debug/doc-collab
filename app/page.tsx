import { DocumentList } from "@/components/document-list"
import { listDocuments } from "@/lib/documents"

export default async function Home() {
  const documents = await listDocuments()

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <DocumentList initialDocuments={documents} />
    </main>
  )
}
