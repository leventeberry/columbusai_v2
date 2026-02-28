/**
 * Phase 3 ingestion: read file, chunk, embed via OpenAI, store in vector DB (no Prisma).
 * Run from apps/web: npm run ingest -- --title "My Doc" --source "manual" --file ./path/to.txt
 */
import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";
import OpenAI from "openai";
import {
  getVectorPool,
  ensureVectorSchema,
  insertDocument,
  insertChunks,
} from "../lib/vector-db";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 100;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end).trim());
    start += CHUNK_SIZE - CHUNK_OVERLAP;
    if (end >= text.length) break;
  }
  return chunks.filter((c) => c.length > 0);
}

function parseArgs(): { title: string; source: string; file: string } {
  const args = process.argv.slice(2);
  let title = "";
  let source = "manual";
  let file = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--title" && args[i + 1]) title = args[++i];
    else if (args[i] === "--source" && args[i + 1]) source = args[++i];
    else if (args[i] === "--file" && args[i + 1]) file = args[++i];
  }
  if (!file) {
    console.error(
      'Usage: npm run ingest -- --title "Title" --source "manual" --file path/to.txt'
    );
    process.exit(1);
  }
  return { title, source, file };
}

async function main() {
  const { title, source, file } = parseArgs();
  const filePath = resolve(process.cwd(), file);
  let rawText: string;
  try {
    rawText = readFileSync(filePath, "utf-8");
  } catch (e) {
    console.error("Failed to read file:", filePath, e);
    process.exit(1);
  }

  const chunks = chunkText(rawText);
  if (chunks.length === 0) {
    console.error("No content to ingest after chunking.");
    process.exit(1);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is required.");
    process.exit(1);
  }

  const pool = getVectorPool();
  await ensureVectorSchema(pool);

  const embedModel =
    process.env.OPENAI_EMBED_MODEL ?? "text-embedding-3-small";
  const client = new OpenAI({ apiKey });

  const embeddingResponse = await client.embeddings.create({
    model: embedModel,
    input: chunks,
  });

  const embeddings = embeddingResponse.data
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((d) => d.embedding);

  if (embeddings.length !== chunks.length) {
    console.error("Embedding count mismatch.");
    process.exit(1);
  }

  const documentId = await insertDocument(pool, {
    source,
    title: title || null,
    content: rawText,
  });

  await insertChunks(
    pool,
    documentId,
    chunks.map((content, i) => ({ content, embedding: embeddings[i] }))
  );

  console.log(
    JSON.stringify({ documentId, chunkCount: chunks.length })
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
