from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
print("1. Starting main.py")
from sentence_transformers import SentenceTransformer
print("2. sentence-transformers imported")
from parser import parse_pdf, parse_docx
from chunker import chunk_pages
from fastapi import Request
from fastapi.responses import StreamingResponse

from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
print("3. qdrant imported")
from pydantic import BaseModel
 
import uuid
import json
import time
from openai import OpenAI
print("4. openai imported")

 
app = FastAPI()
 
# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("5. Loading embedding model...")

# ── Embedding model ─────────────────────────────
embedder = SentenceTransformer("./all-MiniLM-L6-v2")
print("6. Embedding model loaded")
print("7. Loading config...")

# ── Load config ─────────────────────────────────
with open("bot_config.json") as f:
    config = json.load(f)
print("8. Config loaded")
print("9. Creating Qdrant client...")

# ── Qdrant client ───────────────────────────────
qdrant = QdrantClient(
    url=config["qdrant"]["url"],
    prefix=config["qdrant"].get("prefix", None),
    verify=False,
    check_compatibility=False
)
print("10. Qdrant client created")

SESSION_COLLECTION = "RAG_SESSION"
ALL_COLLECTION = "RAG_ALL_DOCS"
 
for col in [SESSION_COLLECTION, ALL_COLLECTION]:
    if col not in [c.name for c in qdrant.get_collections().collections]:
        qdrant.create_collection(
            collection_name=col,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE)
        )
 
# ── LLM client ─────────────────────────────────
llm = OpenAI(
    api_key=config["openai"]["api_key"],
    base_url=config["openai"]["base_url"],
)
llm_model = config["openai"]["model"]
 
 
# ════════════════════════════════════════════════
#  /parse
# ════════════════════════════════════════════════
@app.post("/parse")
async def parse_document(
    file: UploadFile = File(...),
    chunk_size: int = Form(500),
    chunk_overlap: int = Form(50),
    strategy: str = Form("recursive"),
):
    filename = file.filename.lower()
 
    if filename.endswith(".pdf"):
        pages = parse_pdf(file.file)
    elif filename.endswith(".docx"):
        pages = parse_docx(file.file)
    else:
        return {"error": "Unsupported file type"}
 
    if strategy != "recursive":
        return {"error": f"Strategy '{strategy}' not implemented yet"}
 
    chunks = chunk_pages(pages, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    total_chars = sum(c["char_count"] for c in chunks)
 
    return {
        "file_name": file.filename,
        "total_chunks": len(chunks),
        "total_characters": total_chars,
        "chunk_size": chunk_size,
        "chunk_overlap": chunk_overlap,
        "strategy": strategy,
        "pages": pages,
        "chunks": chunks,
    }
 
 
# ════════════════════════════════════════════════
#  /build-kb
# ════════════════════════════════════════════════
@app.post("/build-kb")
async def build_kb(req: Request):
    body = await req.json()
    chunks = body.get("chunks", [])

    # Clear previous session data
    qdrant.recreate_collection(
    collection_name=SESSION_COLLECTION,
    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
)
 
    async def stream():
        total = len(chunks)
 
        if total == 0:
            yield f"data: {json.dumps({'error': 'No chunks received'})}\n\n"
            return
 
        batch_size = 32
 
        # Step 0: preparing
        yield f"data: {json.dumps({'step': 0, 'progress': 0, 'currentChunk': 0, 'totalChunks': total})}\n\n"
 
        # Step 1: embedding + storing
        yield f"data: {json.dumps({'step': 1, 'progress': 0, 'currentChunk': 0, 'totalChunks': total})}\n\n"
 
        try:
            doc_id = str(uuid.uuid4())
            for i in range(0, total, batch_size):
                batch = chunks[i:i + batch_size]
                texts = [c["text"] for c in batch]
 
                vectors = embedder.encode(texts)
                processed = i + len(batch)
                progress = int((processed / total) * 100)
 
                points = [
                    PointStruct(
                        id=str(uuid.uuid4()),
                        vector=vectors[j].tolist(),
                        payload={
                        "text": chunk["text"],
                        "chunk_index": chunk["chunk_index"],
                        "page_number": chunk["page_number"],
                        "doc_id": doc_id
                    }
                    )
                    for j, chunk in enumerate(batch)
                ]
 
                # Write to session collection (temporary)
                qdrant.upsert(collection_name=SESSION_COLLECTION, points=points)

                # Write to global collection (permanent)
                qdrant.upsert(collection_name=ALL_COLLECTION, points=points)
 
                yield f"data: {json.dumps({'progress': progress, 'currentChunk': processed, 'totalChunks': total})}\n\n"
 
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return
 
        # Step 2: done
        yield f"data: {json.dumps({'step': 2, 'progress': 100, 'currentChunk': total, 'totalChunks': total})}\n\n"
 
    return StreamingResponse(stream(), media_type="text/event-stream")
 
 
# ════════════════════════════════════════════════
#  /query  — RAG endpoint
# ════════════════════════════════════════════════
class QueryRequest(BaseModel):
    query: str
    top_k: int = 5
    search_type: str = "similarity"
    score_threshold: float = 0.0
    scope: str = "session" 
 
 
@app.post("/query")
async def query_kb(req: QueryRequest):
    total_start = time.time()
    collection = SESSION_COLLECTION if req.scope == "session" else ALL_COLLECTION
    # ── 1. Embed the question ──────────────────
    query_vector = embedder.encode(req.query).tolist()
 
    # ── 2. Search Qdrant ───────────────────────
    search_start = time.time()
 
    search_results = qdrant.query_points(
        collection_name=collection,
        query=query_vector,
        limit=req.top_k,
        score_threshold=req.score_threshold if req.score_threshold > 0 else None,
    )
    results = search_results.points
 
    search_ms = round((time.time() - search_start) * 1000)
 
    if not results:
        return {
            "answer": "I couldn't find any relevant content in the document for your question. Try rephrasing or lowering the score threshold.",
            "sources": [],
            "search_time_ms": search_ms,
            "total_time_s": round(time.time() - total_start, 2),
        }
 
    # ── 3. Build context from retrieved chunks ─
    sources = []
    context_parts = []
 
    for i, hit in enumerate(results):
        text = hit.payload.get("text", "")
        page = hit.payload.get("page_number", "?")
        chunk_idx = hit.payload.get("chunk_index", i)
        score = round(hit.score, 4)
 
        context_parts.append(f"[Chunk {chunk_idx} | Page {page} | Score {score}]\n{text}")
        sources.append({"chunk_index": chunk_idx, "page_number": page, "score": score, "text": text[:200]})
 
    context = "\n\n---\n\n".join(context_parts)
 
    # ── 4. Generate answer with LLM ───────────
    system_prompt = (
        "You are a helpful document assistant. "
        "Answer the user's question using ONLY the context provided below. "
        "If the context does not contain enough information, say so clearly. "
        "Be concise, accurate, and cite page numbers when relevant."
    )
 
    user_prompt = (
        f"Context from the document:\n\n{context}\n\n"
        f"Question: {req.query}\n\n"
        "Answer:"
    )
 
    try:
        completion = llm.chat.completions.create(
            model=llm_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=1024,
        )
        answer = completion.choices[0].message.content.strip()
    except Exception as e:
        answer = f"Retrieved {len(results)} relevant chunks but LLM generation failed: {str(e)}"
 
    return {
    "answer": answer,
    "sources": sources,
    "search_time_ms": search_ms,
    "total_time_s": round(time.time() - total_start, 2),
    "scope": req.scope   # ← ADD THIS
}
 