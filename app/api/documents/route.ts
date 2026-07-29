import { NextResponse } from "next/server"
import { createDocument, listDocuments } from "@/lib/documents"

export async function GET() {
  try {
    const documents = await listDocuments()
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
    const body = (await request.json().catch(() => ({}))) as {
      title?: string
    }
    const document = await createDocument(body.title)
    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error("POST /api/documents failed:", error)
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    )
  }
}
