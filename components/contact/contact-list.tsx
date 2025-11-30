"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

type ContactMessage = {
    id: string
    name: string
    email: string
    message: string
    receivedAt: string
}

export function ContactList() {
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetch("/api/contact")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setMessages(data.data)
                }
            })
            .finally(() => setLoading(false))
    }, [])

    async function handleDelete(id: string) {
        if (!confirm("Are you sure?")) return

        try {
            const res = await fetch(`/api/contact?id=${id}`, {
                method: "DELETE",
            })
            if (res.ok) {
                setMessages(messages.filter((m) => m.id !== id))
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to delete message", error)
        }
    }

    if (loading) return <div className="text-slate-400 text-center py-10 animate-pulse">Loading messages...</div>

    return (
        <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -5, scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        key={msg.id}
                        className="group bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-pink-500/50 transition-colors duration-300 shadow-lg hover:shadow-pink-500/10"
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <div>
                                    <div className="font-bold text-slate-100 text-lg">{msg.name}</div>
                                    <div className="text-pink-400 text-sm font-medium">{msg.email}</div>
                                </div>
                                <p className="text-slate-400 text-sm whitespace-pre-wrap">{msg.message}</p>
                                <div className="text-xs text-slate-600 pt-2">
                                    {new Date(msg.receivedAt).toLocaleDateString()}
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.2)" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(msg.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                                title="Delete Message"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {!loading && messages.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl text-slate-500"
                >
                    No messages received yet.
                </motion.div>
            )}
        </div>
    )
}
