"use client"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import { Bot, Send, User, Settings, Share, MoreHorizontal, Edit2, FileText, Globe, Mic, Copy, RotateCcw, Check, PanelLeft, Search, Square, Home } from "lucide-react"
import { ChatMessage } from "@/types"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { jsPDF } from "jspdf"

interface ChatInterfaceProps {
    isDocumentLoaded: boolean
    fileName: string | null
    messages: ChatMessage[]
    onSend: (query: string) => void
    onFileUpload: (file: File) => void
    isLoading: boolean
    onRegenerate: (index: number) => void
    onEdit: (index: number, content: string) => void
    onToggleSidebar: () => void
    searchQuery: string
    onSearchQueryChange: (query: string) => void
    onStop: () => void
}

export function ChatInterface({
    isDocumentLoaded,
    fileName,
    messages,
    onSend,
    onFileUpload,
    isLoading,
    onRegenerate,
    onEdit,
    onToggleSidebar,
    searchQuery,
    onStop,
    onSearchQueryChange
}: ChatInterfaceProps) {
    const [input, setInput] = useState("")
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editInput, setEditInput] = useState("")
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isMenuOpen])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isListening, setIsListening] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const toggleMic = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error("Your browser doesn't support speech recognition.")
            return
        }

        if (isListening) {
            setIsListening(false)
            return
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true

        recognition.onstart = () => {
            setIsListening(true)
            toast.success("Listening...")
        }

        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result) => result.transcript)
                .join("")
            setInput(prev => prev ? prev + " " + transcript : transcript)
        }

        recognition.onerror = (event: any) => {
            console.error(event.error)
            setIsListening(false)
            toast.error("Error recognizing speech.")
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        recognition.start()
    }

    const handleSend = () => {
        if (!input.trim() || isLoading) return
        onSend(input)
        setInput("")
    }

    return (
        <div className="flex-1 flex h-full bg-white">
            {/* Main Chat Column */}
            <div className="flex-1 flex flex-col h-full border-r border-transparent">
                {/* Header */}
                <header className="h-16 md:h-20 shrink-0 flex items-center justify-between px-4 md:px-8 border-b border-transparent gap-2 md:gap-4">
                    <div className="flex items-center gap-1 md:gap-2 shrink-0">
                        <button onClick={onToggleSidebar} className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors" title="Toggle Sidebar">
                            <PanelLeft className="w-5 h-5" />
                        </button>
                        <Link href="/">
                            <button className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors" title="Go to Home">
                                <Home className="w-5 h-5" />
                            </button>
                        </Link>
                    </div>
                    
                    <div className="hidden md:block flex-1 max-w-md">
                        <div className="relative flex items-center">
                            <Search className="w-4 h-4 text-neutral-400 absolute left-3 md:left-4" />
                            <input 
                                type="text" 
                                value={searchQuery || ""}
                                onChange={(e) => onSearchQueryChange(e.target.value)}
                                placeholder="Search chats, documents..." 
                                className="w-full bg-white border border-neutral-200 rounded-full py-2 pl-9 md:pl-10 pr-3 md:pr-4 text-sm outline-none focus:border-neutral-300 shadow-sm text-black"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 shrink-0 justify-end">
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Link copied to clipboard!");
                            }} 
                            className="hero-btn hero-btn-sm hero-btn-outline"
                        >
                            <div className="hero-btn-outer"><div className="hero-btn-inner"><span><Share className="w-4 h-4" /> Share</span></div></div>
                        </button>
                        <div className="relative" ref={menuRef}>
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="w-10 h-10 border border-neutral-200 rounded-full flex items-center justify-center hover:bg-neutral-50 shadow-sm text-black"
                            >
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50"
                                    >
                                        <button 
                                            onClick={() => {
                                                localStorage.clear();
                                                window.location.href = "/chat";
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                                        >
                                            Clear Chat History
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (messages.length === 0) {
                                                    toast.error("No messages to export");
                                                    return;
                                                }
                                                const doc = new jsPDF();
                                                let yPos = 20;
                                                doc.setFontSize(16);
                                                doc.text("Lumina Chat Export", 20, yPos);
                                                yPos += 15;
                                                doc.setFontSize(12);
                                                
                                                messages.forEach(m => {
                                                    const roleText = m.role.toUpperCase() + ":";
                                                    doc.setFont("helvetica", "bold");
                                                    doc.text(roleText, 20, yPos);
                                                    yPos += 7;
                                                    
                                                    doc.setFont("helvetica", "normal");
                                                    const splitText = doc.splitTextToSize(m.content, 170);
                                                    
                                                    // Check page boundary
                                                    if (yPos + (splitText.length * 7) > 280) {
                                                        doc.addPage();
                                                        yPos = 20;
                                                    }
                                                    
                                                    doc.text(splitText, 20, yPos);
                                                    yPos += (splitText.length * 7) + 10;
                                                    
                                                    if (yPos > 280) {
                                                        doc.addPage();
                                                        yPos = 20;
                                                    }
                                                });
                                                
                                                doc.save("Lumina-Chat-Export.pdf");
                                                toast.success("Chat exported as PDF successfully!");
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 font-medium"
                                        >
                                            Export Chat
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className={cn("flex-1 flex flex-col overflow-hidden", messages.length === 0 ? "justify-center pb-8 md:pb-24" : "")}>
                    {/* Chat Area */}
                    <div className={cn("overflow-y-auto px-8 custom-scrollbar flex flex-col", messages.length === 0 ? "" : "flex-1 py-6")}>
                        <div className={cn("max-w-3xl mx-auto flex flex-col space-y-8 w-full", messages.length === 0 ? "justify-center" : "")}>
                            {messages.length === 0 ? (
                             <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center text-center space-y-2 md:space-y-4"
                             >
                                <video 
                                    src="/center-video.mp4" 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline 
                                    className="w-40 md:w-60 h-auto mb-1 md:mb-4 mix-blend-multiply"
                                />
                                <h2 className="font-bold text-xl md:text-3xl text-black text-center px-4">How can I help you today?</h2>
                             </motion.div>
                        ) : (
                            <AnimatePresence initial={false}>
                                {messages.map((message, idx) => (
                                    <motion.div 
                                        key={message.id} 
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        layout
                                        className={cn("flex flex-col w-full", message.role === "user" ? "items-end" : "items-start")}
                                    >
                                    <div className={cn(
                                        "max-w-[85%] text-sm leading-relaxed",
                                        message.role === "user" 
                                            ? "bg-[#2B66FF] text-white px-6 py-4 rounded-3xl rounded-br-sm shadow-md"
                                            : "text-black"
                                    )}>
                                        {editingId === message.id ? (
                                            <div className="flex flex-col space-y-3 min-w-[250px]">
                                                <textarea
                                                    autoFocus
                                                    className="w-full p-3 text-sm bg-blue-700 border border-blue-500 rounded-xl outline-none text-white resize-none"
                                                    rows={3}
                                                    value={editInput}
                                                    onChange={(e) => setEditInput(e.target.value)}
                                                />
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-bold text-blue-200 hover:text-white">Cancel</button>
                                                    <button onClick={() => {
                                                        onEdit(idx, editInput)
                                                        setEditingId(null)
                                                    }} className="px-4 py-1.5 text-xs font-bold bg-white text-blue-600 rounded-full shadow-sm">Save</button>
                                                </div>
                                            </div>
                                        ) : (
                                            message.role === "user" ? (
                                                message.content
                                            ) : (
                                                <div className="prose prose-sm max-w-none text-black prose-headings:font-bold prose-headings:text-black">
                                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                                </div>
                                            )
                                        )}
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className={cn(
                                        "flex items-center space-x-4 mt-2 px-1 text-neutral-400",
                                        message.role === "user" ? "mr-4" : "ml-4"
                                    )}>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(message.content)
                                                setCopiedId(message.id)
                                                setTimeout(() => setCopiedId(null), 2000)
                                            }}
                                            className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest hover:text-neutral-700 transition-colors py-1"
                                            title="Copy"
                                        >
                                            {copiedId === message.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copiedId === message.id ? "Copied" : "Copy"}
                                        </button>
                                        
                                        {message.role === "user" && !isLoading && !editingId && (
                                            <button
                                                onClick={() => {
                                                    setEditingId(message.id)
                                                    setEditInput(message.content)
                                                }}
                                                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest hover:text-neutral-700 transition-colors py-1"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                                Edit
                                            </button>
                                        )}

                                        {message.role === "assistant" && !isLoading && (
                                            <button
                                                onClick={() => onRegenerate(idx)}
                                                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest hover:text-neutral-700 transition-colors py-1"
                                                title="Retry"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                                Retry
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                        )}
                        {isLoading && messages[messages.length - 1]?.role === 'user' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-start"
                            >
                                <div className="flex space-x-2 items-center p-4">
                                    <div className="w-2 h-2 rounded-full bg-neutral-300 animate-bounce"></div>
                                    <div className="w-2 h-2 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className={cn("px-4 md:px-8 relative z-10", messages.length === 0 ? "mt-2 md:mt-4" : "pb-12 pt-0")}>
                    <div className="max-w-3xl mx-auto bg-white border-2 border-black rounded-3xl p-2 md:p-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <textarea
                            rows={1}
                            placeholder="Ask anything about your documents..."
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value)
                                e.target.style.height = 'auto'
                                e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                            style={{ 
                                height: input ? undefined : 'auto', // Reset on empty
                                overflowY: input.split('\n').length > 4 ? 'auto' : 'hidden' 
                            }}
                            className="w-full py-2 px-3 text-sm resize-none min-h-[44px] max-h-32 outline-none bg-transparent placeholder-neutral-400 text-black font-normal custom-scrollbar mb-2"
                        />
                        
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-full cursor-pointer transition-colors">
                                    <FileText className="w-3.5 h-3.5 text-red-500" />
                                    <span className="text-xs font-medium text-black">{fileName || "Upload PDF"}</span>
                                    <input type="file" className="hidden" accept=".pdf" onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) onFileUpload(file)
                                    }} />
                                </label>
                                <button 
                                    onClick={toggleMic}
                                    className={cn(
                                        "p-2 rounded-full transition-colors", 
                                        isListening ? "bg-red-100 text-red-500" : "text-neutral-400 hover:bg-neutral-100"
                                    )}
                                    title={isListening ? "Stop listening" : "Start dictation"}
                                >
                                    <Mic className={cn("w-4 h-4", isListening && "animate-pulse")} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                        (!input.trim() || isLoading)
                                            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed" 
                                            : "bg-[#2B66FF] text-white hover:bg-[#1E4BD8] shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
                                    )}
                                    title="Send message"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    )
}
