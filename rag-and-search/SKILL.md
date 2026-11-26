---
name: rag-and-search
description: Build and evaluate full-text, vector, and hybrid search / RAG pipelines — BM25 + dense embedding fusion (RRF), structure-aware chunking, metadata pre-filtering, reranking, citation grounding, and Recall@k/MRR evals.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# RAG and Search

Most "bad RAG answers" are retrieval failures, not LLM failures. Fix chunking, hybrid recall, metadata filtering, and retrieval evaluation before tweaking the generation prompt.

1. **Default to hybrid search (BM25 + dense vectors), not vectors alone** — dense embeddings capture semantic similarity well but routinely miss exact identifiers, error codes, SKUs, function names, and acronyms. Combine lexical search (Postgres `tsvector`, SQLite FTS5, Meilisearch/OpenSearch BM25) with vector search (`pgvector`, `sqlite-vec`, Qdrant) using Reciprocal Rank Fusion (RRF: `score = sum(1 / (k + rank))`, `k=60`).
2. **Chunk by document structure, not blind character slicing** — split on headings, paragraphs, code AST boundaries, or markdown sections first, then enforce a target token window (typically 250–600 tokens with 10–15% overlap). Prepend document title and section breadcrumb (`[Doc: Billing API > Webhooks]`) to each chunk so isolated chunks retain context when retrieved.
3. **Enforce metadata and tenant filters BEFORE top-k vector ranking** — filter by `tenant_id`, `acl`, `doc_type`, or `updated_at` inside the database/index query, never by fetching top-10 globally and filtering in application code (which leaks or returns 0 results). Index filter columns alongside your HNSW/IVFFlat vector index.
4. **Add a cross-encoder reranker on top of a wider first-stage recall** — retrieve top 30–50 candidates via fast hybrid search, then rerank down to the top 5–8 chunks using a lightweight cross-encoder reranker (or LLM listwise rerank) before injecting into the prompt. This consistently beats stuffing 30 noisy chunks into the context window.
5. **Track document versions and re-index incrementally** — store `content_hash`, `source_url`/`doc_id`, `chunk_index`, and `embedding_model` per chunk. On update, diff by `content_hash` and atomically replace/delete stale chunks so deleted or edited docs never haunt retrieval results. Never mix vectors from two different embedding models in the same index.
6. **Ground answers with verifiable chunk citations and abstention** — pass each retrieved chunk with a stable `[id]` and source metadata, instruct the model to cite chunk IDs for factual claims, and explicitly permit "not found in the provided sources" when top retrieval scores fall below a calibrated threshold.
7. **Evaluate retrieval separately from generation** — build a small golden set (30–100 real user queries mapped to expected `doc_id`/`chunk_id`s) and measure **Recall@5**, **Recall@10**, and **MRR/nDCG** automatically on every chunking, embedding, or query-rewrite change. Never tune RAG parameters by eyeballing 2 examples.
8. **Handle query mismatch deliberately when needed** — for short/ambiguous user queries or multi-turn chats, rewrite the follow-up into a standalone search query using recent turn context before embedding/BM25 lookup, while keeping raw exact keywords intact for lexical matching.
9. **Watch index build and memory scaling** — normalize embeddings once at ingest if using cosine similarity (dot product = cosine), configure HNSW `ef_search` for recall vs latency trade-offs, and keep raw chunk text separate from hot vector pages when index size grows.

## Related skills

- `llm-app-integration` — streaming, structured outputs, and prompt caching for the generation step.
- `authorization-and-multitenancy` — enforcing tenant and document-level ACLs on search indexes.
- `sql-query-optimization` — tuning Postgres `pgvector`/GIN indexes and SQLite FTS5 queries.
- `hallucination-evaluation` — measuring groundedness and unsupported claims in generated answers.
- `long-context` — deciding when full-document context beats chunked RAG.
