"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Upload, Paperclip, Copy, Check, Bot, Menu } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

import { ChatMessage } from "@/types"

interface ChatInterfaceProps {
    isDocumentLoaded: boolean
    fileName: string | null
    messages: ChatMessage[]
    onSend: (query: string) => void
    onNewChat: () => void
    onFileUpload: (file: File) => void
    isLoading: boolean
    onToggleSidebar: () => void
    isSidebarOpen: boolean
}

export function ChatInterface({
    isDocumentLoaded,
    fileName,
    messages,
    onSend,
    onNewChat,
    onFileUpload,
    isLoading,
    onToggleSidebar,
    isSidebarOpen
}: ChatInterfaceProps) {
    const [input, setInput] = useState("")
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = () => {
        if (!input.trim() || isLoading) return
        onSend(input)
        setInput("")
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-linear-to-br from-white via-blue-100/80 to-blue-200/70 backdrop-blur-xl relative overflow-hidden shadow-2xl rounded-3xl md:rounded-none md:rounded-l-4xl border-l border-white/60">
            {/* Header */}
            <header className="px-4 py-3 md:px-12 md:py-8 flex items-center justify-between border-b border-white/20">
                <div className="flex items-center space-x-2 md:space-x-4">
                    {!isSidebarOpen && (
                        <button
                            onClick={onToggleSidebar}
                            className="p-1.5 mr-1 hover:bg-black/5 rounded-lg md:hidden text-gray-700"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    )}
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-white/50 rounded-lg md:rounded-2xl flex items-center justify-center border border-white/50 shadow-sm transition-transform hover:scale-110 overflow-hidden p-1.5 md:p-2">
                        <Image src="/lumina-logo.png" alt="Lumina Logo" width={48} height={48} className="object-contain" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-2xl font-black text-gray-900 tracking-tighter m-0 whitespace-nowrap">LUMINA</h1>
                        {isDocumentLoaded && (
                            <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5 md:mt-1">
                                {fileName}
                            </p>
                        )}
                    </div>
                </div>

                <label className="bg-linear-to-br from-blue-500 to-cyan-500 text-white p-2 md:py-4 md:px-8 rounded-full font-bold text-xs md:text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer whitespace-nowrap">
                    <Upload className="w-4 h-4 md:mr-3" />
                    <span className="hidden md:inline">Upload Source</span>
                    <input type="file" className="hidden" accept=".pdf" onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) onFileUpload(file)
                    }} />
                </label>
            </header>

            {/* Main Viewport */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-10">
                <div className={cn(
                    "w-full max-w-4xl mx-auto py-8 md:py-16 flex flex-col",
                    messages.length === 0 ? "h-full justify-center" : "min-h-full justify-start"
                )}>
                    <AnimatePresence>
                        {messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center text-center space-y-12"
                            >
                                <div className="relative group">
                                    <div className="absolute -inset-10 bg-indigo-400/20 blur-[60px] opacity-20" />
                                    <motion.div
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{
                                            duration: 6,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="relative z-10"
                                    >
                                        <Image
                                            src="/bot-mascot-new.png"
                                            alt="Lumina Bot"
                                            width={320}
                                            height={320}
                                            className="w-28 h-28 md:w-80 md:h-80 drop-shadow-2xl hover:scale-105 transition-transform duration-700 pointer-events-none object-contain"
                                            priority
                                        />
                                    </motion.div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter leading-tight drop-shadow-sm">
                                        How can I assist you?
                                    </h2>
                                    <p className="text-gray-500 font-medium text-sm md:text-base max-w-lg mx-auto leading-relaxed px-4">
                                        Connect your data and let's explore professional insights with intelligent document analysis.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-6 md:space-y-12 py-4 md:py-8">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex items-start space-x-3 md:space-x-6",
                                            message.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                                            message.role === "user" ? "active sidebar-icon-wrap" : "bg-white border text-blue-500"
                                        )}>
                                            {message.role === "user" ? <div className="font-bold text-[10px] md:text-xs">YOU</div> : <Bot className="w-5 h-5 md:w-6 md:h-6" />}
                                        </div>

                                        <div className={cn(
                                            "flex flex-col space-y-2 max-w-[80%] md:max-w-[80%]",
                                            message.role === "user" ? "items-end" : "items-start"
                                        )}>
                                            <div className={cn(
                                                message.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                                            )}>
                                                <div className="prose prose-slate max-w-none prose-xs md:prose-sm font-medium leading-relaxed">
                                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                    <div ref={chatEndRef} className="h-4" />
                </div>
            </div>

            {/* Input Area */}
            <footer className="px-3 pb-4 md:px-12 md:pb-12 pt-2 relative z-20">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/70 backdrop-blur-3xl rounded-2xl md:rounded-3xl p-1.5 md:p-4 flex items-end space-x-1.5 md:space-x-4 shadow-[0_20px_50px_rgba(37,99,235,0.1)] border border-black/30">
                        <textarea
                            rows={1}
                            placeholder="Type your question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                            className="flex-1 no-input-border py-4 text-base font-medium text-gray-900 placeholder:text-gray-400 resize-none max-h-40 ml-4 h-14"
                        />

                        <div className="flex items-center space-x-2 md:space-x-4 pr-1.5 pb-1 md:pr-2 md:pb-1">
                            <label className="p-2 md:p-3 text-gray-300 hover:text-blue-500 transition-all cursor-pointer">
                                <Paperclip className="w-5 h-5 md:w-6 md:h-6" />
                                <input type="file" className="hidden" accept=".pdf" onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) onFileUpload(file)
                                }} />
                            </label>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className={cn(
                                    "w-12 h-10 md:w-16 md:h-14 rounded-xl md:rounded-2xl transition-all duration-300 flex items-center justify-center shadow-xl",
                                    input.trim() && !isLoading
                                        ? "active sidebar-icon-wrap hover:scale-105"
                                        : "bg-gray-100 text-gray-300 pointer-events-none"
                                )}
                            >
                                <Send className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
