import { pool } from "@/lib/db"

export type DocumentRow = {
  id: string
  title: string
  created_at: string
  updated_at: string
}

type DbDocument = {
  id: string
  title: string
  created_at: Date | string
  updated_at: Date | string
}

export type HistoryRow = {
  id: string
  document_id: string
  created_at: Date | string
  update: string
  user_id: string
}

function mapDocument(row: DbDocument): DocumentRow {
  return {
    id: row.id,
    title: row.title,
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString(),
  }
}

function mapHistory(row: HistoryRow): HistoryRow {
  return {
    id: row.id,
    document_id: row.document_id,
    created_at: new Date(row.created_at).toISOString(),
    update: row.update,
    user_id: row.user_id,
  }
}

export async function listDocuments(): Promise<DocumentRow[]> {
  const { rows } = await pool.query<DbDocument>(
    `SELECT id, title, created_at, updated_at
     FROM documents
     ORDER BY updated_at DESC`
  )
  return rows.map(mapDocument)
}

export async function getDocument(id: string): Promise<DocumentRow | null> {
  const { rows } = await pool.query<DbDocument>(
    `SELECT id, title, created_at, updated_at
     FROM documents
     WHERE id = $1`,
    [id]
  )
  return rows[0] ? mapDocument(rows[0]) : null
}

export async function createDocument(
  title = "Untitled"
): Promise<DocumentRow> {
  const { rows } = await pool.query<DbDocument>(
    `INSERT INTO documents (title)
     VALUES ($1)
     RETURNING id, title, created_at, updated_at`,
    [title.trim() || "Untitled"]
  )
  return mapDocument(rows[0])
}

export async function updateDocumentTitle(
  id: string,
  title: string
): Promise<DocumentRow | null> {
  const { rows } = await pool.query<DbDocument>(
    `UPDATE documents
     SET title = $2, updated_at = now()
     WHERE id = $1
     RETURNING id, title, created_at, updated_at`,
    [id, title.trim() || "Untitled"]
  )
  return rows[0] ? mapDocument(rows[0]) : null
}

export async function touchDocument(id: string): Promise<void> {
  await pool.query(
    `UPDATE documents SET updated_at = now() WHERE id = $1`,
    [id]
  )
}

export async function getHistory(id: string): Promise<HistoryRow[]> {
  const { rows } = await pool.query<HistoryRow>(
    `SELECT id, document_id, created_at, update, user_id
     FROM document_updates
     WHERE document_id = $1`,
    [id]
  )
  return rows.map(mapHistory)
}