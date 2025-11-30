"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export function BlogForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            title: formData.get("title"),
            slug: formData.get("slug"),
            summary: formData.get("summary"),
            content: formData.get("content"),
            tags: (formData.get("tags") as string).split(",").map(t => t.trim()),
            published: formData.get("published") === "on",
        }

        try {
            const res = await fetch("/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (res.ok) {
                router.refresh();
                (e.target as HTMLFormElement).reset()
            } else {
                const json = await res.json()
                alert(json.error || "Failed to create post")
            }
        } catch (error) {
            console.error(error)
            alert("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const inputClasses = "w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600"
    const labelClasses = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"

    return (
        <motion.form
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            onSubmit={handleSubmit}
            className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-2xl shadow-xl backdrop-blur-sm"
        >
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-700/50">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-100">Create Blog Post</h2>
            </div>

            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Title</label>
                        <motion.input whileFocus={{ scale: 1.02 }} name="title" required className={inputClasses} placeholder="My Awesome Post" />
                    </div>
                    <div>
                        <label className={labelClasses}>Slug</label>
                        <motion.input whileFocus={{ scale: 1.02 }} name="slug" required className={inputClasses} placeholder="my-awesome-post" />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Summary</label>
                    <motion.textarea whileFocus={{ scale: 1.02 }} name="summary" rows={2} className={inputClasses} placeholder="Brief summary..." />
                </div>

                <div>
                    <label className={labelClasses}>Content</label>
                    <motion.textarea whileFocus={{ scale: 1.02 }} name="content" required rows={4} className={inputClasses} placeholder="Markdown content supported..." />
                </div>

                <div>
                    <label className={labelClasses}>Tags (comma separated)</label>
                    <motion.input whileFocus={{ scale: 1.02 }} name="tags" className={inputClasses} placeholder="nextjs, react, tutorial" />
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div className="relative flex items-center">
                        <input type="checkbox" name="published" id="published" className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-600 bg-slate-800 checked:border-cyan-500 checked:bg-cyan-500 transition-all" />
                        <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none">
                            <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <label htmlFor="published" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
                        Publish immediately
                    </label>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-cyan-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Creating Post..." : "Create Post"}
                </motion.button>
            </div>
        </motion.form>
    )
}
