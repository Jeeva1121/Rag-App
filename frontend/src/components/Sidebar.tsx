"use client"

import { useState, useEffect } from "react"
import {
    Plus,
    MessageSquare,
    FileText,
    Clock,
    ChevronLeft,
    Trash2,
    Upload
} from "lucide-react"
import { cn } from "@/lib/utils"

import { ChatMessage, ChatSession } from "@/types"

interface SidebarProps {
    onNewChat: () => void
    onToggle: () => void
    messages: ChatMessage[]
    fileName: string | null
    sessions: ChatSession[]
    onLoadSession: (session: ChatSession) => void
    onDeleteSession: (sessionId: string, e: React.MouseEvent) => void
}

export function Sidebar({ onNewChat, onToggle, messages, fileName, sessions, onLoadSession, onDeleteSession }: SidebarProps) {
    const [view, setView] = useState<'chat' | 'history' | 'files'>('chat')

    return (
        <div className={cn(
            "h-full flex flex-col items-center py-10 shrink-0 relative z-50 glass-card rounded-4xl mr-6 transition-all duration-300 ease-out",
            view === 'chat' ? "w-24" : "w-80"
        )}>
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors shadow-sm bg-white/50 mb-12"
            >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>

            <div className="flex w-full h-full overflow-hidden">
                {/* Icons Column */}
                <nav className="w-24 flex flex-col items-center space-y-6 shrink-0">
                    <div
                        className={cn("sidebar-icon-wrap cursor-pointer group", view === 'chat' ? 'active' : 'inactive')}
                        onClick={() => setView('chat')}
                        title="Current Chat"
                    >
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div
                        className="sidebar-icon-wrap inactive cursor-pointer group"
                        onClick={() => {
                            onNewChat()
                            setView('chat')
                        }}
                        title="New Chat"
                    >
                        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                    </div>
                    <div
                        className={cn("sidebar-icon-wrap cursor-pointer group", view === 'history' ? 'active' : 'inactive')}
                        onClick={() => setView(view === 'history' ? 'chat' : 'history')}
                        title="Chat History"
                    >
                        <Clock className="w-6 h-6" />
                    </div>
                    <div
                        className={cn("sidebar-icon-wrap cursor-pointer group", view === 'files' ? 'active' : 'inactive')}
                        onClick={() => setView(view === 'files' ? 'chat' : 'files')}
                        title="Documents"
                    >
                        <FileText className="w-6 h-6" />
                    </div>
                </nav>

                {/* Expanded Content */}
                <div className={cn(
                    "flex-1 flex flex-col border-l border-gray-100/50 transition-all duration-300",
                    view === 'chat' ? "opacity-0 invisible w-0" : "opacity-100 visible w-full px-6"
                )}>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                        {view === 'history' ? 'Past Conversations' : 'Document Library'}
                    </h3>

                    <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
                        {view === 'history' ? (
                            <div className="space-y-2">
                                {/* Current Session (if active) */}
                                {messages.length > 0 && (
                                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 cursor-pointer shadow-sm overflow-hidden">
                                        <p className="text-xs font-bold text-indigo-600 mb-1">Current Session</p>
                                        <p className="text-sm font-semibold text-gray-700 line-clamp-2 leading-relaxed wrap-break-word">
                                            {messages[0].content}
                                        </p>
                                    </div>
                                )}

                                {/* Archived Sessions */}
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        onClick={() => {
                                            onLoadSession(session)
                                            setView('chat')
                                        }}
                                        className="p-4 rounded-2xl bg-white/50 border border-white/50 cursor-pointer hover:bg-white transition-all group"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-xs font-bold text-gray-400">{session.date}</p>
                                            <button
                                                onClick={(e) => onDeleteSession(session.id, e)}
                                                className="p-1 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-700 line-clamp-2 leading-relaxed">
                                            {session.preview}
                                        </p>
                                    </div>
                                ))}

                                {sessions.length === 0 && messages.length === 0 && (
                                    <div className="text-center py-10">
                                        <p className="text-xs font-medium text-gray-300">No history available</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {fileName ? (
                                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 flex items-center justify-between group">
                                        <div className="flex items-center space-x-3 min-w-0">
                                            <div className="p-2 bg-indigo-600 rounded-lg text-white">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-800 line-clamp-2 break-all leading-tight">{fileName}</p>
                                                <p className="text-[10px] font-medium text-indigo-500 uppercase">Active</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 space-y-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
                                            <Upload className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <p className="text-xs font-medium text-gray-400">No documents uploaded yet</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

