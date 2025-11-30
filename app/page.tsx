"use client"

import { AuthToolbar } from "@/components/auth/auth-toolbar"
import { ProfileForm } from "@/components/profile/profile-form"
import { ProfileList } from "@/components/profile/profile-list"
import { BlogForm } from "@/components/blog/blog-form"
import { BlogList } from "@/components/blog/blog-list"
import { ProjectForm } from "@/components/project/project-form"
import { ProjectList } from "@/components/project/project-list"
import { ContactForm } from "@/components/contact/contact-form"
import { ContactList } from "@/components/contact/contact-list"
import { AiChatbot } from "@/components/chat/ai-chatbot"
import { SessionProvider } from "next-auth/react"
import { motion } from "framer-motion"

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 selection:bg-indigo-500/30">
        <AuthToolbar />

        <motion.main
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto p-6 space-y-16"
        >
          <AiChatbot />

          <motion.div variants={item} className="text-center py-12 space-y-4">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
              API Testing Dashboard
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Manage your content with our sleek, dark-themed interface.
              Sign in to unlock full CRUD capabilities.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Profile Section */}
            <motion.section variants={item} className="space-y-8">
              <ProfileForm />
              <ProfileList />
            </motion.section>

            {/* Blog Section */}
            <motion.section variants={item} className="space-y-8">
              <BlogForm />
              <BlogList />
            </motion.section>

            {/* Project Section */}
            <motion.section variants={item} className="space-y-8">
              <ProjectForm />
              <ProjectList />
            </motion.section>

            {/* Contact Section */}
            <motion.section variants={item} className="space-y-8">
              <ContactForm />
              <ContactList />
            </motion.section>
          </div>
        </motion.main>
      </div>
    </SessionProvider>
  )
}
