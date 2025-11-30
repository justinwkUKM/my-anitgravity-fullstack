"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { motion } from "framer-motion"

export function AuthToolbar() {
    const { data: session, status } = useSession()

    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 text-slate-200 px-6 py-4 flex justify-between items-center shadow-lg"
        >
            <div className="flex items-center gap-3">
                <motion.div
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20"
                >
                    P
                </motion.div>
                <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Portfolio<span className="text-indigo-400">App</span>
                </span>
            </div>

            <div className="flex items-center gap-4">
                {status === "loading" ? (
                    <div className="animate-pulse h-8 w-24 bg-slate-800 rounded"></div>
                ) : session ? (
                    <>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50"
                        >
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-slate-400">Signed in as</span>
                            <span className="font-semibold text-slate-200">{session.user?.email}</span>
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => signOut()}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-sm transition-colors duration-200 font-medium"
                        >
                            Sign Out
                        </motion.button>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        <motion.a
                            whileHover={{ scale: 1.05, color: "#fff" }}
                            href="/register"
                            className="text-slate-400 text-sm font-medium transition-colors"
                        >
                            Register
                        </motion.a>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => signIn()}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm transition-colors duration-200 font-medium shadow-lg shadow-indigo-500/20"
                        >
                            Sign In
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
