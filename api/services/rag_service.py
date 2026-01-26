import os
from typing import List, Optional, Dict, Any
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

class RAGService:
    def __init__(self, api_key: Optional[str] = None, groq_api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        self.groq_api_key = groq_api_key or os.getenv("GROQ_API_KEY")
        
        if not self.api_key:
            # Still need Google key for embeddings
            raise ValueError("Google API Key is required for embeddings")
        if not self.groq_api_key:
            raise ValueError("Groq API Key is required for LLM")
        
        # Milestone 1 & 2: We use FAISS (Local Vector Database)
        # It's high-performance, requires no server setup, and is perfect for RAG.
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=self.api_key
        )
        self.vector_store = None
        self.chat_history = []
        self.vector_store = None
        # Use InMemoryVectorStore for serverless compatibility (fits in 250MB limit)
        self.vector_store = None
        self.chat_history = []
        
        # Setup logging
        import logging
        log_path = "/tmp/backend_debug.log" if self.is_vercel else "backend_debug.log"
        logging.basicConfig(filename=log_path, level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def process_pdf(self, file_path: str):
        """Milestone 1: Document Ingestion & Indexing (using FAISS)"""
        loader = PyMuPDFLoader(file_path)
        documents = loader.load()
        
        if not documents:
            self.logger.error("No documents loaded from PDF")
            raise ValueError("Could not extract text from PDF. It might be empty or scanned images.")
            
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            add_start_index=True
        )
        chunks = text_splitter.split_documents(documents)
        
        if not chunks:
            self.logger.error("No chunks created from documents")
            raise ValueError("Document processed but no text chunks created.")

        self.logger.info(f"Created {len(chunks)} chunks")
        
        # Using InMemoryVectorStore for robust serverless performance
        self.vector_store = InMemoryVectorStore.from_documents(chunks, self.embeddings)
        self.logger.info("Created in-memory vector store")
        
        return len(chunks)

    def get_chat_response(self, query: str):
        """Milestone 2 & 3: RAG Pipeline with Groq Llama 3"""
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            groq_api_key=self.groq_api_key,
            temperature=0.3,
            streaming=True
        )

        if not self.vector_store:
            # Fallback to general chat if no document is loaded
            return llm.stream(query)

        # 1. Contextualize Question (Dialogue Management)
        # This helps in handling follow-up questions
        contextualize_q_system_prompt = (
            "Given a chat history and the latest user question "
            "which might reference context in the chat history, "
            "formulate a standalone question which can be understood "
            "without the chat history. Do NOT answer the question, "
            "just reformulate it if needed and otherwise return it as is."
        )
        
        contextualize_q_prompt = ChatPromptTemplate.from_messages([
            ("system", contextualize_q_system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ])
        
        retriever = self.vector_store.as_retriever(search_kwargs={"k": 5})
        history_aware_retriever = create_history_aware_retriever(
            llm, retriever, contextualize_q_prompt
        )

        # 2. Answer Synthesis (RAG Pipeline)
        system_prompt = (
            "You are an AI assistant specialized in document analysis. "
            "Use the provided context to answer the user's question accurately. "
            "If the answer is not in the context, use your general knowledge but "
            "clearly mention that the information is from your own knowledge base "
            "and not the document. "
            "\n\n"
            "Context: {context}"
        )
        
        qa_prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ])

        question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
        rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

        return rag_chain.stream({"input": query, "chat_history": self.chat_history})

    def update_history(self, query: str, answer: str):
        """Manage dialogue history (Milestone 3)"""
        self.chat_history.append(HumanMessage(content=query))
        self.chat_history.append(AIMessage(content=answer))
        # Keep sliding window for performance
        if len(self.chat_history) > 10:
            self.chat_history = self.chat_history[-10:]

    def clear_history(self):
        self.chat_history = []

# Singleton instance management
_service_cache: Dict[str, RAGService] = {}

def get_rag_service(api_key: Optional[str] = None, groq_api_key: Optional[str] = None) -> RAGService:
    # Use only the Google API key (or 'default') as the session identifier
    # This ensures the vector_store persists across upload and chat calls
    session_id = api_key or "default"
    
    if session_id not in _service_cache:
        _service_cache[session_id] = RAGService(api_key, groq_api_key)
    
    service = _service_cache[session_id]
    
    # Update the Groq key if a fresh one is provided in the request
    if groq_api_key and service.groq_api_key != groq_api_key:
        service.groq_api_key = groq_api_key
        
    return service
