"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Message = {
    id: string
    role: "user" | "assistant"
    content: string
    createdAt?: Date
}

export function AiChatbot() {
    const { data: session } = useSession()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(true)

    // Load chat history on mount
    useEffect(() => {
        if (session) {
            loadChatHistory()
        }
    }, [session])

    const loadChatHistory = async () => {
        try {
            const response = await fetch("/api/chat-history")
            if (response.ok) {
                const history = await response.json()
                setMessages(history.map((msg: any) => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    createdAt: new Date(msg.createdAt)
                })))
            }
        } catch (error) {
            console.error("Error loading chat history:", error)
        }
    }

    const saveMessage = async (role: string, content: string) => {
        try {
            await fetch("/api/chat-history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role, content })
            })
        } catch (error) {
            console.error("Error saving message:", error)
        }
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            createdAt: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        // Save user message to database
        await saveMessage("user", userMessage.content)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            })

            if (!response.ok) throw new Error("Failed to get response")

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let assistantMessage = ""
            const assistantId = (Date.now() + 1).toString()

            setMessages(prev => [...prev, {
                id: assistantId,
                role: "assistant",
                content: "",
                createdAt: new Date()
            }])

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) {
                        break
                    }

                    // Decode the chunk - plain text
                    const chunk = decoder.decode(value, { stream: true })
                    assistantMessage += chunk

                    setMessages(prev => {
                        const updated = prev.map(m =>
                            m.id === assistantId ? { ...m, content: assistantMessage } : m
                        )
                        return updated
                    })
                }
            }

            // Save assistant message to database
            if (assistantMessage) {
                await saveMessage("assistant", assistantMessage)
            }
        } catch (error) {
            console.error("Chat error:", error)
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again.",
                createdAt: new Date()
            }])
        } finally {
            setIsLoading(false)
        }
    }

    if (!session) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl mx-auto mb-12"
        >
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10">
                {/* Header */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-4 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-200">AI Assistant</h3>
                            <p className="text-xs text-slate-400">Powered by Gemini Flash</p>
                        </div>
                    </div>
                    <button className="text-slate-400 hover:text-white transition-colors">
                        <svg className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>

                {/* Chat Area */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="h-[400px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                {messages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                                        <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                        <p>Ask me anything about your projects or code!</p>
                                    </div>
                                )}

                                {messages.map(m => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={m.id}
                                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                                            }`}>
                                            <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code: ({ node, inline, className, children, ...props }: any) => (
                                                            inline ?
                                                                <code className="bg-slate-900 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                                                    {children}
                                                                </code> :
                                                                <code className="block bg-slate-900 p-3 rounded-lg text-xs font-mono overflow-x-auto" {...props}>
                                                                    {children}
                                                                </code>
                                                        ),
                                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                        ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                                                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                                                        li: ({ children }) => <li className="mb-1">{children}</li>,
                                                        a: ({ href, children }) => <a href={href} className="text-indigo-400 hover:text-indigo-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                                                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                                        em: ({ children }) => <em className="italic">{children}</em>,
                                                    }}
                                                >
                                                    {m.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-700 flex items-center gap-1">
                                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 flex gap-2 bg-slate-900/50">
                                <input
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message..."
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </motion.button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
