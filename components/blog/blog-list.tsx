"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

type BlogPost = {
    id: string
    title: string
    slug: string
    published: boolean
    tags: string[]
    createdAt: string
}

export function BlogList() {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetch("/api/blog")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setPosts(data.data)
                }
            })
            .finally(() => setLoading(false))
    }, [])

    async function handleDelete(id: string) {
        if (!confirm("Are you sure?")) return

        try {
            const res = await fetch(`/api/blog?id=${id}`, {
                method: "DELETE",
            })
            if (res.ok) {
                setPosts(posts.filter((p) => p.id !== id))
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to delete post", error)
        }
    }

    if (loading) return <div className="text-slate-400 text-center py-10 animate-pulse">Loading posts...</div>

    return (
        <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
                {posts.map((post) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -5, scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        key={post.id}
                        className="group bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-cyan-500/50 transition-colors duration-300 shadow-lg hover:shadow-cyan-500/10"
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="font-bold text-slate-100 text-lg">{post.title}</div>
                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${post.published ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                        {post.published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <div className="text-slate-500 text-sm font-mono">{post.slug}</div>

                                {post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="text-xs bg-slate-800 text-cyan-400 px-2 py-1 rounded border border-slate-700">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.2)" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(post.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                                title="Delete Post"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {!loading && posts.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl text-slate-500"
                >
                    No posts found. Create one above!
                </motion.div>
            )}
        </div>
    )
}
