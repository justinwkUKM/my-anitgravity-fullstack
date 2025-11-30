"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export function ProfileForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        const social = {
            linkedin: data.linkedin,
            github: data.github,
            twitter: data.twitter,
        }
        delete data.linkedin
        delete data.github
        delete data.twitter

        const payload = { ...data, social }

        try {
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                router.refresh();
                (e.target as HTMLFormElement).reset()
            } else {
                const json = await res.json()
                alert(json.error || "Failed to create profile")
            }
        } catch (error) {
            console.error(error)
            alert("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const inputClasses = "w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
    const labelClasses = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"

    return (
        <motion.form
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            onSubmit={handleSubmit}
            className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-2xl shadow-xl backdrop-blur-sm"
        >
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-700/50">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-100">Create Profile</h2>
            </div>

            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Full Name</label>
                        <motion.input whileFocus={{ scale: 1.02 }} name="fullName" required className={inputClasses} placeholder="John Doe" />
                    </div>
                    <div>
                        <label className={labelClasses}>Tagline</label>
                        <motion.input whileFocus={{ scale: 1.02 }} name="tagline" className={inputClasses} placeholder="Software Engineer" />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Bio</label>
                    <motion.textarea whileFocus={{ scale: 1.02 }} name="bio" rows={3} className={inputClasses} placeholder="Tell us about yourself..." />
                </div>

                <div>
                    <label className={labelClasses}>Email</label>
                    <motion.input whileFocus={{ scale: 1.02 }} name="email" type="email" className={inputClasses} placeholder="john@example.com" />
                </div>

                <div className="pt-4 border-t border-slate-700/50">
                    <label className={labelClasses}>Social Links</label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                        <motion.input whileFocus={{ scale: 1.05 }} name="linkedin" className={inputClasses} placeholder="LinkedIn URL" />
                        <motion.input whileFocus={{ scale: 1.05 }} name="github" className={inputClasses} placeholder="GitHub URL" />
                        <motion.input whileFocus={{ scale: 1.05 }} name="twitter" className={inputClasses} placeholder="Twitter URL" />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Creating Profile..." : "Create Profile"}
                </motion.button>
            </div>
        </motion.form>
    )
}
