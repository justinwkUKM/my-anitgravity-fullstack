"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export function ProjectForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            title: formData.get("title"),
            description: formData.get("description"),
            link: formData.get("link"),
            image: formData.get("image"),
            technologies: (formData.get("technologies") as string).split(",").map(t => t.trim()).filter(Boolean),
        }

        try {
            const res = await fetch("/api/project", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (res.ok) {
                router.refresh();
                (e.target as HTMLFormElement).reset()
            } else {
                const json = await res.json()
                alert(json.error || "Failed to create project")
            }
        } catch (error) {
            console.error(error)
            alert("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const inputClasses = "w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder:text-slate-600"
    const labelClasses = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"

    return (
        <motion.form
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            onSubmit={handleSubmit}
            className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-2xl shadow-xl backdrop-blur-sm"
        >
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-700/50">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-100">Add Project</h2>
            </div>

            <div className="space-y-5">
                <div>
                    <label className={labelClasses}>Project Title</label>
                    <motion.input whileFocus={{ scale: 1.02 }} name="title" required className={inputClasses} placeholder="My Awesome Project" />
                </div>

                <div>
                    <label className={labelClasses}>Description</label>
                    <motion.textarea whileFocus={{ scale: 1.02 }} name="description" rows={3} className={inputClasses} placeholder="What does this project do?" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Project Link</label>
                        <motion.input whileFocus={{ scale: 1.02 }} name="link" className={inputClasses} placeholder="https://..." />
                    </div>
                    <div>
                        <label className={labelClasses}>Image URL</label>
                        <motion.input whileFocus={{ scale: 1.02 }} name="image" className={inputClasses} placeholder="https://..." />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Technologies (comma separated)</label>
                    <motion.input whileFocus={{ scale: 1.02 }} name="technologies" className={inputClasses} placeholder="Next.js, TypeScript, Prisma" />
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-purple-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Adding Project..." : "Add Project"}
                </motion.button>
            </div>
        </motion.form>
    )
}
