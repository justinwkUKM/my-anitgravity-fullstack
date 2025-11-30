"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export function ContactForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            message: formData.get("message"),
        }

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (res.ok) {
                router.refresh();
                (e.target as HTMLFormElement).reset()
                alert("Message sent successfully!")
            } else {
                const json = await res.json()
                alert(json.error || "Failed to send message")
            }
        } catch (error) {
            console.error(error)
            alert("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const inputClasses = "w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 outline-none transition-all placeholder:text-slate-600"
    const labelClasses = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"

    return (
        <motion.form
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            onSubmit={handleSubmit}
            className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-2xl shadow-xl backdrop-blur-sm"
        >
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-700/50">
                <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-100">Send Message</h2>
            </div>

            <div className="space-y-5">
                <div>
                    <label className={labelClasses}>Your Name</label>
                    <motion.input whileFocus={{ scale: 1.02 }} name="name" required className={inputClasses} placeholder="John Doe" />
                </div>

                <div>
                    <label className={labelClasses}>Email Address</label>
                    <motion.input whileFocus={{ scale: 1.02 }} name="email" type="email" required className={inputClasses} placeholder="john@example.com" />
                </div>

                <div>
                    <label className={labelClasses}>Message</label>
                    <motion.textarea whileFocus={{ scale: 1.02 }} name="message" required rows={4} className={inputClasses} placeholder="Hello there..." />
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-pink-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Sending..." : "Send Message"}
                </motion.button>
            </div>
        </motion.form>
    )
}
