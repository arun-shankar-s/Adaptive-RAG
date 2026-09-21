# RAG Parser

RAG Parser is a React and FastAPI application for parsing PDF/DOCX files, splitting their text into chunks, indexing the chunks, and asking questions over the indexed content.

## Key Features

- Upload PDF and DOCX documents.
- Extract PDF pages or DOCX paragraph text.
- Split content with configurable chunk size, overlap, and recursive chunking.
- Search and inspect parsed chunks in the frontend.
- Generate `all-MiniLM-L6-v2` embeddings and store vectors in Qdrant.
- Track knowledge-base indexing progress through a streamed backend response.
- Query the current document or all indexed documents with configurable top-k and score threshold settings.
- Generate answers from retrieved context through the configured OpenAI-compatible model endpoint.

## Tech Stack

- **Frontend:** React 19, React DOM, Vite
- **Backend:** Python, FastAPI, Uvicorn
- **Document processing:** `pypdf`, `python-docx`
- **Chunking:** LangChain text splitters
- **Embeddings:** Sentence Transformers with `all-MiniLM-L6-v2`
- **Vector database:** Qdrant
- **LLM client:** OpenAI Python client

## Architecture

1. The React frontend uploads a PDF or DOCX to `POST /parse`.
2. FastAPI extracts the document text and returns pages and chunks.
3. The frontend sends the chunks to `POST /build-kb`; the backend embeds them in batches and writes them to session and all-document Qdrant collections while streaming progress events.
4. Query mode sends questions to `POST /query`.
5. FastAPI embeds the question, retrieves matching Qdrant points, builds a context, and requests an answer from the configured model endpoint.

## Project Structure

```text
backend/
  main.py             FastAPI application and API endpoints
  parser.py           PDF and DOCX text extraction
  chunker.py          Recursive text chunking
  bot_config.json     Qdrant and model endpoint configuration
  requirements.txt    Python dependencies
frontend/
  src/                React application and UI components
  package.json        Frontend scripts and dependencies
  vite.config.js      Vite configuration
knowledge_base.png    Knowledge-base indexing screenshot
parse.png             Parsed chunks screenshot
QA.png                Query view screenshot
```

## Installation & Run

### Backend

Run from `backend/` because the application loads `bot_config.json` and the local embedding model using relative paths.

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

The backend expects the configured Qdrant service, OpenAI-compatible endpoint, and local `./all-MiniLM-L6-v2` embedding model referenced by `backend/main.py` and `backend/bot_config.json`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend calls the backend at `http://127.0.0.1:8001`.

## Screenshots

### Parsed Chunks

![Parsed chunks](parse.png)

### Knowledge Base

![Knowledge-base indexing](knowledge_base.png)

### Q&A

![Document Q&A](QA.png)

## Author

Not specified in the project files.
