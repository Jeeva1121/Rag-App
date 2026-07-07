"use client"
import { useState, useEffect, useRef } from "react"
import { Sidebar } from "@/components/Sidebar"
import { ChatInterface } from "@/components/ChatInterface"
import { Toaster, toast } from "sonner"
import { ChatMessage, ChatSession, UploadedDocument } from "@/types"

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string | null>(null)
    const [isDocumentLoaded, setIsDocumentLoaded] = useState(false)
    const [pdfText, setPdfText] = useState<string | null>(null)
    const [documents, setDocuments] = useState<UploadedDocument[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const abortControllerRef = useRef<AbortController | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [deviceId, setDeviceId] = useState<string>("")
    const [searchQuery, setSearchQuery] = useState("")

    const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || ""

    // Load history and sessions
    useEffect(() => {
        const savedMessages = localStorage.getItem("lumina_history")
        const savedFile = localStorage.getItem("lumina_filename")
        const savedDocStatus = localStorage.getItem("lumina_doc_status")
        const savedPdfText = localStorage.getItem("lumina_pdf_text")
        const savedSessions = localStorage.getItem("lumina_sessions")
        const savedActiveSessionId = localStorage.getItem("lumina_active_session_id")
        const savedDocs = localStorage.getItem("lumina_documents")
        let savedDeviceId = localStorage.getItem("lumina_device_id")

        if (!savedDeviceId) {
            savedDeviceId = Math.random().toString(36).substring(7)
            localStorage.setItem("lumina_device_id", savedDeviceId)
        }
        setDeviceId(savedDeviceId)

        if (savedMessages) setMessages(JSON.parse(savedMessages))
        if (savedFile) setFileName(savedFile)
        if (savedDocStatus) setIsDocumentLoaded(JSON.parse(savedDocStatus))
        if (savedPdfText) setPdfText(savedPdfText)
        if (savedSessions) setSessions(JSON.parse(savedSessions))
        if (savedActiveSessionId) setCurrentSessionId(savedActiveSessionId)
        if (savedDocs) setDocuments(JSON.parse(savedDocs))

        // Restore templates
        const savedSnow = localStorage.getItem("template_snowfall")
        if (savedSnow) document.body.classList.add("snowfall-active")

        // Open sidebar by default on large screens
        if (window.innerWidth > 1024) {
            setIsSidebarOpen(true)
        }
    }, [])

    // Sync history & Active Session
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("lumina_history", JSON.stringify(messages))
        }
        if (sessions.length > 0) {
            localStorage.setItem("lumina_sessions", JSON.stringify(sessions))
        }
        if (fileName) localStorage.setItem("lumina_filename", fileName)
        if (isDocumentLoaded) localStorage.setItem("lumina_doc_status", JSON.stringify(isDocumentLoaded))
        if (pdfText) localStorage.setItem("lumina_pdf_text", pdfText)
        if (documents.length > 0) localStorage.setItem("lumina_documents", JSON.stringify(documents))
        if (currentSessionId) {
            localStorage.setItem("lumina_active_session_id", currentSessionId)
        } else {
            localStorage.removeItem("lumina_active_session_id")
        }
    }, [messages, fileName, isDocumentLoaded, sessions, pdfText, currentSessionId, documents])

    // Dynamic session naming and synchronization effect
    useEffect(() => {
        if (messages.length > 0 && currentSessionId) {
            setSessions(prev => {
                const exists = prev.some(s => s.id === currentSessionId)
                
                if (exists) {
                    return prev.map(s => s.id === currentSessionId ? { ...s, messages } : s)
                } else {
                    const firstMsg = messages.find(m => m.role === "user")?.content || "New Conversation"
                    const newSession: ChatSession = {
                        id: currentSessionId,
                        date: new Date().toLocaleDateString(),
                        preview: "Generating title...",
                        messages
                    }
                    
                    // Asynchronously fetch AI title for the new session
                    const fetchTitle = async () => {
                        try {
                            const apiBaseUrl = typeof window !== "undefined" ? window.location.origin : ""
                            const res = await fetch(`${apiBaseUrl}/api/title`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ query: firstMsg, groq_api_key: groqApiKey })
                            })
                            if (res.ok) {
                                const data = await res.json()
                                setSessions(current => current.map(s => s.id === currentSessionId ? { ...s, preview: data.title } : s))
                            }
                        } catch (e) {
                            console.error("Failed to generate title", e)
                            setSessions(current => current.map(s => s.id === currentSessionId ? { ...s, preview: firstMsg.substring(0, 40) } : s))
                        }
                    }
                    
                    fetchTitle()
                    return [newSession, ...prev]
                }
            })
        }
    }, [messages, currentSessionId])

    const getApiBaseUrl = () => {
        if (typeof window !== "undefined") return window.location.origin
        return ""
    }

    const handleFileUpload = async (file: File | null) => {
        if (!file) return
        setIsLoading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("user_id", deviceId)

        try {
            const apiBaseUrl = getApiBaseUrl()
            const response = await fetch(`${apiBaseUrl}/api/upload`, {
                method: "POST",
                body: formData,
            })
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.detail || `Upload failed with status ${response.status}`)
            }
            const data = await response.json()
            setFileName(file.name)
            setPdfText(data.text || null)
            setIsDocumentLoaded(true)
            setDocuments(prev => {
                const exists = prev.find(d => d.name === file.name)
                if (exists) return prev
                return [{
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                    uploadedAt: new Date().toLocaleDateString()
                }, ...prev]
            })
            toast.success("Document analyzed")
        } catch (err: any) {
            console.error("Upload Error:", err)
            toast.error(err.message || "Upload failed: Connection error")
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegenerate = (index: number) => {
        if (index <= 0) return
        const previousUserQuery = messages[index - 1].content
        setMessages(prev => prev.slice(0, index))
        handleSend(previousUserQuery, true)
    }

    const handleEdit = (index: number, newQuery: string) => {
        setMessages(prev => prev.slice(0, index))
        handleSend(newQuery)
    }

    const handleSend = async (query: string, isRegenerate = false) => {
        let activeId = currentSessionId
        if (!activeId) {
            activeId = Math.random().toString(36).substring(7)
            setCurrentSessionId(activeId)
        }

        const assistantId = Math.random().toString(36)

        if (!isRegenerate) {
            const userMsg: ChatMessage = { id: Math.random().toString(36), role: "user", content: query }
            setMessages(prev => [...prev, userMsg])
        }

        setIsLoading(true)

        const controller = new AbortController()
        abortControllerRef.current = controller

        try {
            const apiBaseUrl = getApiBaseUrl()
            const response = await fetch(`${apiBaseUrl}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query,
                    groq_api_key: groqApiKey,
                    user_id: deviceId,
                    pdf_text: pdfText
                }),
                signal: controller.signal
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.detail || `Server error: ${response.status}`)
            }

            const reader = response.body?.getReader()
            if (!reader) return

            setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }])
            let content = ""
            const decoder = new TextDecoder()
            let buffer = ""
            let lastUpdateTime = Date.now()

            const updateMessages = (force = false) => {
                const now = Date.now()
                if (force || now - lastUpdateTime > 50) {
                    setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content } : m))
                    lastUpdateTime = now
                }
            }

            while (true) {
                const { done, value } = await reader.read()
                if (done) {
                    // Process any remaining buffer content if it's not empty
                    if (buffer.trim()) {
                        const lines = buffer.split("\n\n")
                        for (const line of lines) {
                            try {
                                const trimmedLine = line?.trim();
                                if (!trimmedLine || typeof trimmedLine !== 'string' || !trimmedLine.startsWith("data: ")) continue;
                                const dataStr = trimmedLine.slice(6).trim();
                                if (dataStr === "[DONE]") break;
                                try {
                                    const data = JSON.parse(dataStr)
                                    if (data.type === "content" && data.content) {
                                        content += data.content
                                        updateMessages()
                                    } else if (data.type === "error") {
                                        toast.error(data.detail || "AI Error")
                                    }
                                } catch (e) {}
                            } catch (e) {
                                console.error("Error processing line:", e);
                            }
                        }
                    }
                    updateMessages(true) // Force final update
                    break
                }

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split("\n\n")
                
                // Keep the last partial chunk in the buffer to be processed in the next iteration
                buffer = lines.pop() || ""

                for (const line of lines) {
                    try {
                        const trimmedLine = line?.trim();
                        if (!trimmedLine || typeof trimmedLine !== 'string' || !trimmedLine.startsWith("data: ")) continue;

                        const dataStr = trimmedLine.slice(6).trim();
                        if (dataStr === "[DONE]") {
                            buffer = ""; // Clear buffer so it doesn't process after [DONE]
                            break;
                        }

                        try {
                            const data = JSON.parse(dataStr)
                            if (data.type === "content" && data.content) {
                                content += data.content
                                updateMessages()
                            } else if (data.type === "error") {
                                toast.error(data.detail || "AI Error")
                            }
                        } catch (e) {
                            // JSON split across chunks handled by the buffer, shouldn't happen often now
                        }
                    } catch (e) {
                        console.error("Error processing line:", e);
                    }
                }
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                toast.info("Generation stopped")
            } else {
                console.error("Chat Error:", err)
                toast.error(err.message || "Connection failed")
            }
        } finally {
            abortControllerRef.current = null
            setIsLoading(false)
        }
    }

    const handleNewChat = () => {
        setMessages([])
        setCurrentSessionId(null)
        setFileName(null)
        setPdfText(null)
        setIsDocumentLoaded(false)
        localStorage.removeItem("lumina_history")
        localStorage.removeItem("lumina_filename")
        localStorage.removeItem("lumina_doc_status")
        localStorage.removeItem("lumina_pdf_text")
        localStorage.removeItem("lumina_active_session_id")
    }

    const filteredSessions = sessions.filter(s => s.preview.toLowerCase().includes(searchQuery.toLowerCase()))
    const filteredDocuments = documents.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
        <main className="flex h-screen w-full overflow-hidden bg-white font-sans">
            <Toaster position="top-right" theme="light" richColors />

            {/* Sidebar drawer */}
            <div className={`fixed inset-y-0 left-0 z-50 h-full transition-all duration-300 ease-in-out lg:relative ${isSidebarOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-0 overflow-hidden'}`}>
                <Sidebar
                    onNewChat={handleNewChat}
                    onToggle={() => setIsSidebarOpen(false)}
                    fileName={fileName}
                    sessions={filteredSessions}
                    documents={filteredDocuments}
                    onLoadSession={(s: ChatSession) => {
                        setMessages(s.messages)
                        setCurrentSessionId(s.id)
                        if (window.innerWidth < 1024) setIsSidebarOpen(false)
                    }}
                    onDeleteSession={(id: string, e: React.MouseEvent) => {
                        e.stopPropagation()
                        const updated = sessions.filter(s => s.id !== id)
                        setSessions(updated)
                        localStorage.setItem("lumina_sessions", JSON.stringify(updated))
                        if (currentSessionId === id) {
                            handleNewChat()
                        }
                    }}
                />
            </div>

            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                />
            )}

            <div className="flex-1 flex overflow-hidden">
                <ChatInterface
                    isDocumentLoaded={isDocumentLoaded}
                    fileName={fileName}
                    messages={messages}
                    onSend={handleSend}
                    onFileUpload={handleFileUpload}
                    isLoading={isLoading}
                    onRegenerate={handleRegenerate}
                    onEdit={handleEdit}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    onStop={() => {
                        abortControllerRef.current?.abort()
                    }}
                />
            </div>
        </main>
    )
}
