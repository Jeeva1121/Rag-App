"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/Sidebar"
import { ChatInterface } from "@/components/ChatInterface"
import { Toaster, toast } from "sonner"
import { Menu } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

import { ChatMessage, ChatSession } from "@/types"

export default function Home() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const [isDocumentLoaded, setIsDocumentLoaded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""
    const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || ""

    // Load history and sessions
    useEffect(() => {
        const savedMessages = localStorage.getItem("lumina_history")
        const savedFile = localStorage.getItem("lumina_filename")
        const savedDocStatus = localStorage.getItem("lumina_doc_status")
        const savedSessions = localStorage.getItem("lumina_sessions")

        if (savedMessages) setMessages(JSON.parse(savedMessages))
        if (savedFile) setFileName(savedFile)
        if (savedDocStatus) setIsDocumentLoaded(JSON.parse(savedDocStatus))
        if (savedSessions) setSessions(JSON.parse(savedSessions))
    }, [])

    // Sync history
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("lumina_history", JSON.stringify(messages))
        }
        if (sessions.length > 0) {
            localStorage.setItem("lumina_sessions", JSON.stringify(sessions))
        }
        if (fileName) localStorage.setItem("lumina_filename", fileName)
        if (isDocumentLoaded) localStorage.setItem("lumina_doc_status", JSON.stringify(isDocumentLoaded))
    }, [messages, fileName, isDocumentLoaded, sessions])

    const handleFileUpload = async (file: File | null) => {
        if (!file) return
        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("api_key", apiKey)

        try {
            const response = await fetch("http://localhost:8000/upload", {
                method: "POST",
                body: formData,
            })
            if (!response.ok) throw new Error("Connection failed")
            setFileName(file.name)
            setIsDocumentLoaded(true)
            toast.success("Document analyzed")
        } catch (error) {
            toast.error("Upload failed")
        } finally {
            setIsUploading(false)
        }
    }

    const handleSend = async (query: string) => {
        const userMsg: ChatMessage = { id: Math.random().toString(36), role: "user", content: query }
        const assistantId = Math.random().toString(36)
        setMessages(prev => [...prev, userMsg])
        setIsLoading(true)

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, api_key: apiKey, groq_api_key: groqApiKey })
            })
            const reader = response.body?.getReader()
            if (!reader) return
            setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }])
            let content = ""
            const decoder = new TextDecoder()
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const chunk = decoder.decode(value)
                const lines = chunk.split("\n\n")
                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue
                    const dataStr = line.replace("data: ", "")
                    if (dataStr === "[DONE]") break
                    try {
                        const data = JSON.parse(dataStr)
                        if (data.type === "content") {
                            content += data.content
                            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content } : m))
                        }
                    } catch (e) { }
                }
            }
        } catch (error) {
            toast.error("Connection failed")
        } finally {
            setIsLoading(false)
        }
    }

    const handleNewChat = () => {
        if (messages.length > 0) {
            const newSession: ChatSession = {
                id: Math.random().toString(36),
                date: new Date().toLocaleDateString(),
                preview: messages[0].content.substring(0, 100),
                messages: messages
            }
            setSessions(prev => [newSession, ...prev])
            localStorage.setItem("lumina_sessions", JSON.stringify([newSession, ...sessions]))
        }

        setMessages([])
        setFileName(null)
        setIsDocumentLoaded(false)
        localStorage.removeItem("lumina_history")
        localStorage.removeItem("lumina_filename")
        localStorage.removeItem("lumina_doc_status")
    }

    const handleLoadSession = (session: ChatSession) => {
        setMessages(session.messages)
    }

    const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const updatedSessions = sessions.filter(s => s.id !== sessionId)
        setSessions(updatedSessions)
        localStorage.setItem("lumina_sessions", JSON.stringify(updatedSessions))
    }

    return (
        <main className="flex h-screen w-full overflow-hidden p-6 bg-transparent relative">
            <Toaster position="top-right" theme="light" richColors />

            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        {/* Mobile Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ width: 0, opacity: 0, x: -50 }}
                            animate={{ width: "auto", opacity: 1, x: 0 }}
                            exit={{ width: 0, opacity: 0, x: -50 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="shrink-0 fixed inset-y-0 left-0 z-50 h-full md:relative md:inset-auto"
                        >
                            <Sidebar
                                onNewChat={handleNewChat}
                                onToggle={() => setIsSidebarOpen(false)}
                                messages={messages}
                                fileName={fileName}
                                sessions={sessions}
                                onLoadSession={handleLoadSession}
                                onDeleteSession={handleDeleteSession}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {!isSidebarOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute top-6 left-6 z-50 p-3 glass-card rounded-xl hover:scale-110 transition-transform active:scale-95 md:top-10 md:left-10"
                >
                    <Menu className="w-6 h-6 text-gray-800" />
                </motion.button>
            )}

            <div className="flex-1 flex justify-center items-center h-full relative p-2">
                <div
                    className="w-full h-full flex flex-col glass-card rounded-4xl overflow-hidden max-w-7xl transition-all duration-300"
                >
                    <ChatInterface
                        isDocumentLoaded={isDocumentLoaded}
                        fileName={fileName}
                        messages={messages}
                        onSend={handleSend}
                        onNewChat={handleNewChat}
                        onFileUpload={handleFileUpload}
                        isLoading={isLoading}
                    />

                </div>
            </div>
        </main>
    )
}
