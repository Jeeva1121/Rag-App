import os
from typing import List, Optional, Dict, Any
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_classic.chains import create_history_aware_retriever, create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

class RAGService:
    def __init__(self, user_id: str = "default", api_key: Optional[str] = None, groq_api_key: Optional[str] = None):
        self.user_id = user_id
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
        self.chat_history = []
        # Check if running on Vercel
        self.is_vercel = os.environ.get("VERCEL") == "1"
        
        # Use separate index path for each user
        if self.is_vercel:
            self.index_path = f"/tmp/faiss_index_{self.user_id}"
            log_path = f"/tmp/backend_debug_{self.user_id}.log"
        else:
            self.index_path = os.path.abspath(f"faiss_index_{self.user_id}")
            log_path = f"backend_debug_{self.user_id}.log"
        
        # Setup logging
        import logging
        logging.basicConfig(filename=log_path, level=logging.INFO)
        self.logger = logging.getLogger(__name__)

        # Load existing index if available
        if os.path.exists(self.index_path):
            try:
                self.vector_store = FAISS.load_local(
                    self.index_path, 
                    self.embeddings, 
                    allow_dangerous_deserialization=True
                )
                self.logger.info(f"Loaded existing vector store from {self.index_path}")
                print(f"DEBUG: Loaded existing vector store from {self.index_path}")
            except Exception as e:
                self.logger.error(f"Failed to load vector store: {e}")
                print(f"DEBUG: Failed to load vector store: {e}")

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
        
        # Using FAISS as our robust vector database
        self.vector_store = FAISS.from_documents(chunks, self.embeddings)
        
        # Save index to disk for persistence
        self.vector_store.save_local(self.index_path)
        self.logger.info(f"Saved vector store to {self.index_path}")
        print(f"DEBUG: Saved vector store to {self.index_path}")
        
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

# Singleton instance management (Isolates users in memory)
_service_cache: Dict[str, RAGService] = {}

def get_rag_service(user_id: str = "default", api_key: Optional[str] = None, groq_api_key: Optional[str] = None) -> RAGService:
    # Use the unique user_id as the session identifier
    if user_id not in _service_cache:
        _service_cache[user_id] = RAGService(user_id, api_key, groq_api_key)
    
    service = _service_cache[user_id]
    
    # Update the Groq key if a fresh one is provided in the request
    if groq_api_key and service.groq_api_key != groq_api_key:
        service.groq_api_key = groq_api_key
        
    return service
