import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET - Fetch last 25 chat messages for the current user
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const messages = await prisma.chatMessage.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 25,
        })

        // Reverse to show oldest first
        return NextResponse.json(messages.reverse())
    } catch (error) {
        console.error("Error fetching chat messages:", error)
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }
}

// POST - Save a new chat message
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const { role, content } = await req.json()

        if (!role || !content) {
            return NextResponse.json({ error: "Role and content are required" }, { status: 400 })
        }

        const message = await prisma.chatMessage.create({
            data: {
                userId: user.id,
                role,
                content,
            },
        })

        return NextResponse.json(message)
    } catch (error) {
        console.error("Error saving chat message:", error)
        return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
    }
}

// DELETE - Clear all chat history for the current user
export async function DELETE() {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        await prisma.chatMessage.deleteMany({
            where: { userId: user.id },
        })

        return NextResponse.json({ message: "Chat history cleared" })
    } catch (error) {
        console.error("Error clearing chat history:", error)
        return NextResponse.json({ error: "Failed to clear history" }, { status: 500 })
    }
}
