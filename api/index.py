from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import shutil
import os
import json
from typing import Optional
from services.rag_service import get_rag_service

app = FastAPI(title="RAG Chatbot API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check if running on Vercel
IS_VERCEL = os.environ.get("VERCEL") == "1"
UPLOAD_DIR = "/tmp/uploads" if IS_VERCEL else "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/api")
async def root():
    return {"status": "online", "message": "RAG API is running"}

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...), api_key: Optional[str] = Form(None)):
    """Milestone 1: Document Ingestion"""
    print(f"DEBUG: Internal Upload Request - File: {file.filename}, API Key: {api_key[:10] if api_key else 'None'}...")
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are currently supported")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        service = get_rag_service(api_key)
        num_chunks = service.process_pdf(file_path)
        
        return {
            "filename": file.filename,
            "status": "indexed",
            "chunks": num_chunks,
            "message": f"Successfully indexed {num_chunks} chunks from {file.filename}"
        }
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(
    query: str = Body(..., embed=True),
    api_key: Optional[str] = Body(None),
    groq_api_key: Optional[str] = Body(None)
):
    """Milestone 2 & 3: RAG Pipeline & Conversational Interface"""
    print(f"DEBUG: Internal Chat Request - Query: {query[:20]}, API Key: {api_key[:10] if api_key else 'None'}...")
    try:
        service = get_rag_service(api_key, groq_api_key)
        print(f"DEBUG: Service Instance: {id(service)}, Vector Store Loaded: {service.vector_store is not None}")
        
        async def event_generator():
            full_answer = ""
            sources_sent = False
            
            try:
                # Use stream to yield tokens and sources
                for chunk in service.get_chat_response(query):
                    # Handle LangChain retrieval chain chunks
                    if isinstance(chunk, dict):
                        # Content chunk
                        if "answer" in chunk:
                            token = chunk["answer"]
                            full_answer += token
                            yield f"data: {json.dumps({'type': 'content', 'content': token})}\n\n"
                        
                        # Sources chunk (sent once)
                        if "context" in chunk and not sources_sent:
                            sources = []
                            for doc in chunk["context"]:
                                sources.append({
                                    "page": doc.metadata.get("page", 0) + 1,
                                    "snippet": doc.page_content[:300] + "..."
                                })
                            yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"
                            sources_sent = True
                    else:
                        # Direct LLM stream (fallback)
                        content = chunk.content if hasattr(chunk, 'content') else str(chunk)
                        full_answer += content
                        yield f"data: {json.dumps({'type': 'content', 'content': content})}\n\n"
                
                # Update history after full response
                service.update_history(query, full_answer)
                yield "data: [DONE]\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'detail': str(e)})}\n\n"
                yield "data: [DONE]\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/clear")
async def clear_session(api_key: Optional[str] = Body(None)):
    service = get_rag_service(api_key)
    service.clear_history()
    return {"message": "Session history cleared"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
