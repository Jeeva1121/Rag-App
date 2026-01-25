# RAG Nexus - Intelligent Document Assistant

This project is a full-stack Retrieval-Augmented Generation (RAG) application built to meet the requirements of Milestones 1, 2, and 3.

## 🚀 Features

### Milestone 1: Document Ingestion & Indexing
- **PDF Processing**: Upload and parse PDF documents using `PyMuPDF`.
- **Intelligent Splitting**: Text is split into meaningful chunks with overlap to maintain context.
- **Vector Storage**: Chunks are embedded using Google's `text-embedding-004` and stored in a local `FAISS` index.

### Milestone 2: RAG Pipeline Development
- **Contextual Retrieval**: Retrieves the top relevant chunks for every query.
- **Answer Synthesis**: Integrates with Gemini 1.5 Flash to generate grounded answers.
- **Source Citations**: Every answer includes clickable citations showing the exact page and snippet from the document.

### Milestone 3: Conversational Interface & Dialogue Management
- **Premium UI**: Modern, glassmorphism design with sleek animations (Framer Motion).
- **Dialogue Management**: Uses a history-aware retriever to handle multi-turn conversations and follow-up questions (e.g., "Tell me more about the first point").
- **Streaming Responses**: Real-time token streaming for a responsive chat experience.

## 🛠️ Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS v4, Lucide Icons, Framer Motion, React Markdown.
- **Backend**: FastAPI (Python), LangChain, Google Generative AI (Gemini), FAISS.

## 🏃 Getting Started

### Backend Setup
1. Navigate to the `backend` folder.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file and add your `GOOGLE_API_KEY`.
4. Run the server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 📝 Usage
1. Open `http://localhost:3000`.
2. Enter your Google API Key in the sidebar (or set it in the backend `.env`).
3. Upload a PDF document.
4. Start chatting with your document!
