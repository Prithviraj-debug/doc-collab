import { NextResponse } from "next/server"
import { createDocument, listDocumentsByUserId } from "@/lib/documents"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const documents = await listDocumentsByUserId(session.user.id)
    return NextResponse.json({ documents })
  } catch (error) {
    console.error("GET /api/documents failed:", error)
    return NextResponse.json(
      { error: "Failed to list documents" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json().catch(() => ({}))) as {
      title?: string
    }
    const document = await createDocument(body.title, session.user.id)
    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error("POST /api/documents failed:", error)
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    )
  }
}
