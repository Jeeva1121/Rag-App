# Lumina RAG-App 🤖✨

Lumina is a professional RAG (Retrieval-Augmented Generation) application built for intelligent document analysis and high-performance chatting.

## 🚀 Quick Start

### 1. Backend Setup (Python)
Navigate to the `backend` folder and install dependencies:
```bash
cd backend
pip install -r requirements.txt
```
**Required Packages:**
- `fastapi`, `uvicorn`: Web framework and server
- `langchain`, `langchain-community`, `langchain-google-genai`: AI orchestration
- `faiss-cpu`: Vector database for document search
- `pymupdf`: PDF processing
- `python-dotenv`: Environment variable management

Run the backend:
```bash
python main.py
```

### 2. Frontend Setup (Next.js)
Navigate to the `frontend` folder and install dependencies:
```bash
cd frontend
npm install
```
**Key Dependencies:**
- `next`, `react`, `react-dom`: Framework core
- `framer-motion`: Premium animations
- `lucide-react`: Modern icons
- `sonner`: Toast notifications
- `tailwind-merge`, `clsx`: Styling utilities
- `react-markdown`: Markdown rendering for AI responses

Run the frontend:
```bash
npm run dev
```

## ✨ Features
- **Intelligent RAG**: Upload PDFs and ask complex questions based on the content.
- **ChatGPT-Style Actions**: Real-time inline editing and regeneration in the thread.
- **Session History**: Copy, Rename, and Rerun past conversations.
- **Premium UI**: Ultra-responsive design with glassmorphism and smooth animations.

## 🔑 Environment Variables
Create a `.env` in `backend` and `.env.local` in `frontend`:
- `GOOGLE_API_KEY`: For Gemini embeddings/analysis.
- `GROQ_API_KEY`: For ultra-fast Llama-3 chatting.
