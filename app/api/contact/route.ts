import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET - Fetch contact messages
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (id) {
            // Fetch single contact message by ID
            const message = await prisma.contactMessage.findUnique({
                where: { id },
            });

            if (!message) {
                return Response.json(
                    { success: false, error: "Contact message not found" },
                    { status: 404 }
                );
            }

            return Response.json({ success: true, data: message });
        }

        // Fetch all contact messages
        const messages = await prisma.contactMessage.findMany({
            orderBy: { receivedAt: "desc" },
        });

        return Response.json({ success: true, data: messages });
    } catch (error) {
        console.error("Error fetching contact message(s):", error);
        return Response.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

// POST - Create new contact message
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, message } = body;

        if (!name || !email || !message) {
            return Response.json(
                { success: false, error: "Name, email, and message are required" },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return Response.json(
                { success: false, error: "Invalid email format" },
                { status: 400 }
            );
        }

        const contactMessage = await prisma.contactMessage.create({
            data: {
                name,
                email,
                message,
            },
        });

        return Response.json({ success: true, data: contactMessage });
    } catch (error) {
        console.error("Error creating contact message:", error);
        return Response.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

// DELETE - Delete contact message
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return Response.json(
                { success: false, error: "Contact message ID is required" },
                { status: 400 }
            );
        }

        // Check if message exists
        const message = await prisma.contactMessage.findUnique({
            where: { id },
        });

        if (!message) {
            return Response.json(
                { success: false, error: "Contact message not found" },
                { status: 404 }
            );
        }

        await prisma.contactMessage.delete({
            where: { id },
        });

        return Response.json({ success: true, message: "Contact message deleted successfully" });
    } catch (error) {
        console.error("Error deleting contact message:", error);
        return Response.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
