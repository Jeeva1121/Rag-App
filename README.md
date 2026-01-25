# Lumina RAG-App 🤖✨

<p align="center">
  <img src="./frontend/public/bot-mascot-new.png" width="200" alt="Lumina Mascot">
</p>

Lumina is a professional RAG (Retrieval-Augmented Generation) application built for intelligent document analysis and high-performance chatting.

## 🏗️ System Architecture & Workflow

The application follows a structured RAG pipeline to provide accurate, context-aware answers:

1.  **Document Intake**: PDFs are uploaded via the frontend and processed by the FastAPI backend.
2.  **Vectorization**: Using `PyMuPDF` for extraction and `Gemini Embeddings`, the document is split into smaller chunks and converted into high-dimensional vectors.
3.  **Indexing**: Vectors are stored in a `FAISS` local vector database for ultra-fast semantic search.
4.  **Retrieval**: When a user asks a question, the system finds the most relevant document chunks based on semantic similarity.
5.  **Generation**: The retrieved context + the user's query are sent to **Groq (Llama-3)** for high-speed, professional response generation.
6.  **Interactive Loop**: Features real-time thread editing and regeneration for a seamless, ChatGPT-like experience.

## 🚀 Quick Start

### 1. Backend Setup (Python)
Navigate to the `backend` folder and install dependencies:
```bash
cd backend
pip install fastapi uvicorn python-multipart langchain langchain-community langchain-google-genai langchain-text-splitters pymupdf faiss-cpu python-dotenv
```

Run the backend:
```bash
python main.py
```

### 2. Frontend Setup (Next.js)
Navigate to the `frontend` folder and install dependencies:
```bash
cd frontend
npm install next react react-dom framer-motion lucide-react sonner tailwind-merge clsx react-markdown three @react-three/fiber @react-three/drei
```

Run the frontend:
```bash
npm run dev
```

## ✨ Key Features
- **Intelligent RAG**: Deep document understanding with vector search.
- **Dynamic Interface**: Glassmorphic UI with 3D mascot and custom avatars.
- **ChatGPT Logic**: True in-thread message editing and answer regeneration.
- **Pro UI/UX**: Compact, mobile-responsive layout designed for productivity.

## 🔑 Environment Variables
Create a `.env` in `backend` and `.env.local` in `frontend`:
- `GOOGLE_API_KEY`: For document embedding and analysis.
- `GROQ_API_KEY`: For high-speed LLM inference.
