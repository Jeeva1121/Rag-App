"use client"
import { useState } from "react"
import { Plus, MessageSquare, FileText, LayoutTemplate, MoreVertical, Trash2, File, User, Globe, Settings } from "lucide-react"
import { ChatSession, UploadedDocument } from "@/types"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps {
    onNewChat: () => void
    onToggle: () => void
    fileName: string | null
    sessions: ChatSession[]
    documents?: UploadedDocument[]
    onLoadSession: (session: ChatSession) => void
    onDeleteSession: (sessionId: string, e: React.MouseEvent) => void
}

export function Sidebar({ onNewChat, onToggle, sessions, documents = [], onLoadSession, onDeleteSession }: SidebarProps) {
    const [activeTab, setActiveTab] = useState<'chats' | 'documents' | 'templates'>('chats')

    return (
        <div className="flex h-full border-r border-neutral-200 bg-[#F4F7FB] text-black z-40 w-[260px] shrink-0 flex-col">
            
            {/* Top Branding */}
            <div className="p-6 pb-4 mb-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
                </Link>
            </div>

            {/* Scrollable Actions & History */}
            <div className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar">
                
                <div className="pt-2">
                    <button
                        onClick={onNewChat}
                        className="hero-btn hero-btn-md"
                        style={{ display: 'block', width: '100%', overflow: 'hidden', borderRadius: '100em' }}
                    >
                        <div className="hero-btn-outer" style={{ width: '100%', overflow: 'hidden', borderRadius: '100em' }}>
                            <div className="hero-btn-inner" style={{ width: '100%', justifyContent: 'center', boxSizing: 'border-box' }}>
                                <span><Plus className="w-4 h-4" /> New Chat</span>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Main Menu */}
                <div className="space-y-1 mt-6 relative">
                    <button 
                        onClick={() => setActiveTab('chats')} 
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors relative z-10 ${activeTab === 'chats' ? 'text-blue-600' : 'text-neutral-600 hover:bg-neutral-100'}`}
                    >
                        <User className="w-4 h-4" /> Chats
                    </button>
                    <button 
                        onClick={() => setActiveTab('documents')} 
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors relative z-10 ${activeTab === 'documents' ? 'text-blue-600' : 'text-neutral-600 hover:bg-neutral-100'}`}
                    >
                        <Globe className="w-4 h-4" /> Documents
                    </button>
                    <button 
                        onClick={() => setActiveTab('templates')} 
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors relative z-10 ${activeTab === 'templates' ? 'text-blue-600' : 'text-neutral-600 hover:bg-neutral-100'}`}
                    >
                        <Settings className="w-4 h-4" /> Templates
                    </button>

                    {/* Animated Indicator */}
                    <div className="absolute left-0 top-0 w-full pointer-events-none">
                        <AnimatePresence>
                            {activeTab === 'chats' && <motion.div layoutId="tab-indicator" className="absolute top-0 left-0 w-full h-10 bg-blue-100/50 rounded-xl" />}
                            {activeTab === 'documents' && <motion.div layoutId="tab-indicator" className="absolute top-11 left-0 w-full h-10 bg-blue-100/50 rounded-xl" />}
                            {activeTab === 'templates' && <motion.div layoutId="tab-indicator" className="absolute top-[88px] left-0 w-full h-10 bg-blue-100/50 rounded-xl" />}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Dynamic List Section based on Active Tab */}
                <div className="pt-4 relative min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'chats' && (
                            <motion.div 
                                key="chats-view"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-3"
                            >
                                <span className="text-xs font-medium text-neutral-400 block px-4">Your Chats</span>
                                
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase tracking-wider font-medium text-neutral-400 block px-4 mt-4 mb-2">Today</span>
                                    {sessions.length === 0 ? (
                                        <p className="text-xs font-medium text-neutral-500 px-4">No recent sessions</p>
                                    ) : (
                                        sessions.map((session) => (
                                            <div
                                                key={session.id}
                                                onClick={() => onLoadSession(session)}
                                                className="group w-full flex items-center justify-between px-4 py-2 rounded-xl hover:bg-neutral-100 cursor-pointer transition-colors text-sm text-neutral-700 font-semibold relative"
                                            >
                                                <span className="truncate pr-4">{session.preview}</span>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <button onClick={(e) => onDeleteSession(session.id, e)} className="text-neutral-400 hover:text-red-500 p-1">
                                                         <Trash2 className="w-3.5 h-3.5" />
                                                     </button>
                                                     <button className="text-neutral-400 hover:text-black p-1">
                                                         <MoreVertical className="w-3.5 h-3.5" />
                                                     </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'documents' && (
                            <motion.div 
                                key="docs-view"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-3"
                            >
                                <span className="text-xs font-medium text-neutral-400 block px-4">Your Documents</span>
                                
                                <div className="space-y-2 mt-4">
                                    {documents.length === 0 ? (
                                        <p className="text-xs font-medium text-neutral-500 px-4 mt-2">No documents uploaded yet.</p>
                                    ) : (
                                        documents.map((doc) => (
                                            <div key={doc.id} className="w-full flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-neutral-100 cursor-pointer transition-colors border border-transparent hover:border-neutral-200">
                                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                                    <File className="w-4 h-4 text-red-500" />
                                                </div>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="text-sm font-semibold text-neutral-700 truncate">{doc.name}</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-neutral-400 font-medium">{doc.size}</span>
                                                        <span className="text-[10px] text-neutral-300">•</span>
                                                        <span className="text-[10px] text-neutral-400 font-medium">{doc.uploadedAt}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'templates' && (
                            <motion.div 
                                key="templates-view"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-3"
                            >
                                <span className="text-xs font-medium text-neutral-400 block px-4">Templates</span>
                                <div className="mt-2 space-y-2 px-2">
                                    <button 
                                        onClick={() => {
                                            const isSnow = document.body.classList.contains("snowfall-active");
                                            if (isSnow) {
                                                document.body.classList.remove("snowfall-active");
                                                localStorage.removeItem("template_snowfall");
                                            } else {
                                                document.body.classList.add("snowfall-active");
                                                localStorage.setItem("template_snowfall", "true");
                                            }
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg font-medium flex items-center justify-between"
                                    >
                                        <span>❄️ Snowfall Mode</span>
                                        <span className="text-[10px] bg-neutral-200 px-2 py-0.5 rounded-full">Toggle</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
