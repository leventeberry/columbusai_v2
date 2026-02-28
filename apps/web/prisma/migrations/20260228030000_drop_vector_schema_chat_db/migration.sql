-- Remove vector schema from chat database; RAG now uses separate database (columbus_vectors).
DROP SCHEMA IF EXISTS vector CASCADE;
