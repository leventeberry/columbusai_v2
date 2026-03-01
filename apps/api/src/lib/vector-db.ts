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

export function getVectorPool(): Pool {
  if (!_pool) _pool = getPool();
  return _pool;
}

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

export interface ChunkRow {
  id: string;
  content: string;
}

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
