/**
 * Vector RAG database client (Postgres + pgvector). No Prisma — raw pg.
 * Uses VECTOR_DATABASE_URL (e.g. columbus_vectors database).
 */
import { Pool } from "pg";

const EMBEDDING_DIM = 1536;

export function getVectorDatabaseUrl(): string | undefined {
  return process.env.VECTOR_DATABASE_URL;
}

function getPool(): Pool {
  const url = getVectorDatabaseUrl();
  if (!url) throw new Error("VECTOR_DATABASE_URL is required for vector DB");
  return new Pool({ connectionString: url, max: 10 });
}

let _pool: Pool | null = null;

/** Get or create a shared pool for the vector DB. */
export function getVectorPool(): Pool {
  if (!_pool) _pool = getPool();
  return _pool;
}

/** Create tables and indexes if they do not exist. Safe to call on every startup or once. */
export async function ensureVectorSchema(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        title TEXT,
        content TEXT,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS chunks (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        embedding vector(${EMBEDDING_DIM}),
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS chunks_document_id_chunk_index_idx
      ON chunks(document_id, chunk_index);
    `);
    // IVFFlat requires rows; create after first ingest or ignore if empty (sequential scan is fine for small data).
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS chunks_embedding_idx
        ON chunks USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
      `);
    } catch {
      // Index may fail on empty table; optional for small datasets.
    }
  } finally {
    client.release();
  }
}

export interface InsertDocumentRow {
  source: string;
  title: string | null;
  content: string | null;
}

/** Insert a document and return its id. */
export async function insertDocument(
  pool: Pool,
  row: InsertDocumentRow
): Promise<string> {
  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO documents (id, source, title, content) VALUES ($1, $2, $3, $4)`,
    [id, row.source, row.title, row.content]
  );
  return id;
}

/** Insert chunks with embeddings. */
export async function insertChunks(
  pool: Pool,
  documentId: string,
  chunks: { content: string; embedding: number[] }[]
): Promise<void> {
  const client = await pool.connect();
  try {
    for (let i = 0; i < chunks.length; i++) {
      const id = crypto.randomUUID();
      const embeddingStr = "[" + chunks[i].embedding.join(",") + "]";
      await client.query(
        `INSERT INTO chunks (id, document_id, chunk_index, content, embedding)
         VALUES ($1, $2, $3, $4, $5::vector)`,
        [id, documentId, i, chunks[i].content, embeddingStr]
      );
    }
  } finally {
    client.release();
  }
}

export interface ChunkRow {
  id: string;
  content: string;
}

/** Return top-k chunks by L2 distance to the query embedding. */
export async function searchChunks(
  pool: Pool,
  embedding: number[],
  k: number
): Promise<ChunkRow[]> {
  const embeddingStr = "[" + embedding.join(",") + "]";
  const result = await pool.query<ChunkRow>(
    `SELECT id, content FROM chunks
     ORDER BY embedding <-> $1::vector
     LIMIT $2`,
    [embeddingStr, k]
  );
  return result.rows;
}
