-- Enable pgvector extension (required for vector column type)
CREATE EXTENSION IF NOT EXISTS vector;

-- Ensure vector schema exists (idempotent)
CREATE SCHEMA IF NOT EXISTS vector;

-- Drop placeholder table from Phase 1
DROP TABLE IF EXISTS vector."VectorReserved";

-- CreateTable: vector.documents
CREATE TABLE vector.documents (
    id TEXT NOT NULL,
    source TEXT NOT NULL,
    title TEXT,
    content TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT documents_pkey PRIMARY KEY (id)
);

-- CreateTable: vector.chunks (with pgvector embedding column)
CREATE TABLE vector.chunks (
    id TEXT NOT NULL,
    document_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chunks_pkey PRIMARY KEY (id)
);

-- Index for document_id + chunk_index
CREATE INDEX chunks_document_id_chunk_index_idx ON vector.chunks(document_id, chunk_index);

-- Vector similarity search index (IVFFlat, L2 distance)
CREATE INDEX chunks_embedding_idx ON vector.chunks USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- Foreign key
ALTER TABLE vector.chunks ADD CONSTRAINT chunks_document_id_fkey FOREIGN KEY (document_id) REFERENCES vector.documents(id) ON DELETE CASCADE ON UPDATE CASCADE;
