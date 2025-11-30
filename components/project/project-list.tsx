"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

type Project = {
    id: string
    title: string
    description: string | null
    link: string | null
    technologies: string[]
}

export function ProjectList() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetch("/api/project")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setProjects(data.data)
                }
            })
            .finally(() => setLoading(false))
    }, [])

    async function handleDelete(id: string) {
        if (!confirm("Are you sure?")) return

        try {
            const res = await fetch(`/api/project?id=${id}`, {
                method: "DELETE",
            })
            if (res.ok) {
                setProjects(projects.filter((p) => p.id !== id))
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to delete project", error)
        }
    }

    if (loading) return <div className="text-slate-400 text-center py-10 animate-pulse">Loading projects...</div>

    return (
        <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
                {projects.map((project) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -5, scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        key={project.id}
                        className="group bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-purple-500/50 transition-colors duration-300 shadow-lg hover:shadow-purple-500/10"
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="font-bold text-slate-100 text-lg">{project.title}</div>
                                    {project.link && (
                                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs bg-slate-800 hover:bg-slate-700 text-purple-400 px-2 py-1 rounded border border-slate-700 transition-colors">
                                            Visit ↗
                                        </a>
                                    )}
                                </div>
                                {project.description && <p className="text-slate-400 text-sm line-clamp-2">{project.description}</p>}

                                {project.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {project.technologies.map(tech => (
                                            <span key={tech} className="text-xs bg-slate-800 text-purple-300 px-2 py-1 rounded border border-slate-700">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.2)" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(project.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                                title="Delete Project"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {!loading && projects.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl text-slate-500"
                >
                    No projects found. Add one above!
                </motion.div>
            )}
        </div>
    )
}
