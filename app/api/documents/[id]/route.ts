import { NextResponse } from "next/server"
import { getDocument, getHistory, updateDocumentTitle } from "@/lib/documents"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const document = await getDocument(id)

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error("GET /api/documents/[id] failed:", error)
    return NextResponse.json(
      { error: "Failed to load document" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = (await request.json()) as { title?: string }

    if (typeof body.title !== "string") {
      return NextResponse.json(
        { error: "title must be a string" },
        { status: 400 }
      )
    }

    const document = await updateDocumentTitle(id, body.title)
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error("PATCH /api/documents/[id] failed:", error)
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    )
  }
}

export async function GET_HISTORY(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const history = await getHistory(id)
    return NextResponse.json({ history })
  } catch (error) {
    console.error("GET /api/documents/[id]/history failed:", error)
    return NextResponse.json(
      { error: "Failed to load history" },
      { status: 500 }
    )
  }
}