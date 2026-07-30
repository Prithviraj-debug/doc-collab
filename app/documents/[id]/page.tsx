import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { getDocumentForUser, getSnapshots, toSnapshotMeta } from "@/lib/documents"
import { DocumentWorkspace } from "@/components/document-workspace"

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

  const snapshots = (await getSnapshots(document.id)).map(toSnapshotMeta)

  return (
    <DocumentWorkspace
      documentId={document.id}
      title={document.title}
      user={session.user}
      snapshots={snapshots}
    />
  )
}
