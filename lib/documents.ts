import { pool } from "@/lib/db"

export type DocumentRow = {
  id: string
  title: string
  created_at: string
  updated_at: string
  role?: string
}

type DbDocument = {
  id: string
  title: string
  created_at: Date | string
  updated_at: Date | string
  role?: string
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
    ...(row.role ? { role: row.role } : {}),
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

export async function listDocumentsByUserId(
  userId: string | number
): Promise<DocumentRow[]> {
  const { rows } = await pool.query<DbDocument>(
    `SELECT d.id, d.title, d.created_at, d.updated_at, m.role
     FROM documents d
     INNER JOIN document_members m ON d.id = m.document_id
     WHERE m.user_id = $1
     ORDER BY d.updated_at DESC`,
    [userId]
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

export async function getDocumentForUser(
  documentId: string,
  userId: string | number
): Promise<DocumentRow | null> {
  const { rows } = await pool.query<DbDocument>(
    `SELECT d.id, d.title, d.created_at, d.updated_at, m.role
     FROM documents d
     INNER JOIN document_members m ON d.id = m.document_id
     WHERE d.id = $1 AND m.user_id = $2`,
    [documentId, userId]
  )
  return rows[0] ? mapDocument(rows[0]) : null
}

/**
 * Creates a document and assigns the current user as owner.
 * Both writes run in one transaction so you never get an orphaned doc.
 */
export async function createDocument(
  title = "Untitled",
  userId: string | number
): Promise<DocumentRow> {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const { rows } = await client.query<DbDocument>(
      `INSERT INTO documents (title)
       VALUES ($1)
       RETURNING id, title, created_at, updated_at`,
      [title.trim() || "Untitled"]
    )
    const document = rows[0]

    await client.query(
      `INSERT INTO document_members (document_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [document.id, userId]
    )

    await client.query("COMMIT")
    return mapDocument({ ...document, role: "owner" })
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
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
