import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET - Fetch project(s)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (id) {
            // Fetch single project by ID
            const project = await prisma.project.findUnique({
                where: { id },
            });

            if (!project) {
                return Response.json(
                    { success: false, error: "Project not found" },
                    { status: 404 }
                );
            }

            return Response.json({ success: true, data: project });
        }

        // Fetch all projects
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: "desc" },
        });

        return Response.json({ success: true, data: projects });
    } catch (error) {
        console.error("Error fetching project(s):", error);
        return Response.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

// POST - Create new project
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, image, link, technologies, completedAt } = body;

        if (!title) {
            return Response.json(
                { success: false, error: "Title is required" },
                { status: 400 }
            );
        }

        const project = await prisma.project.create({
            data: {
                title,
                description,
                image,
                link,
                technologies: technologies || [],
                completedAt: completedAt ? new Date(completedAt) : null,
            },
        });

        return Response.json({ success: true, data: project });
    } catch (error) {
        console.error("Error creating project:", error);
        return Response.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

// PUT - Update existing project
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, title, description, image, link, technologies, completedAt } = body;

        if (!id) {
            return Response.json(
                { success: false, error: "Project ID is required" },
                { status: 400 }
            );
        }

        // Check if project exists
        const existingProject = await prisma.project.findUnique({
            where: { id },
        });

        if (!existingProject) {
            return Response.json(
                { success: false, error: "Project not found" },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData: any = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (image !== undefined) updateData.image = image;
        if (link !== undefined) updateData.link = link;
        if (technologies !== undefined) updateData.technologies = technologies;
        if (completedAt !== undefined) {
            updateData.completedAt = completedAt ? new Date(completedAt) : null;
        }

        const project = await prisma.project.update({
            where: { id },
            data: updateData,
        });

        return Response.json({ success: true, data: project });
    } catch (error) {
        console.error("Error updating project:", error);
        return Response.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

// DELETE - Delete project
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return Response.json(
                { success: false, error: "Project ID is required" },
                { status: 400 }
            );
        }

        // Check if project exists
        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            return Response.json(
                { success: false, error: "Project not found" },
                { status: 404 }
            );
        }

        await prisma.project.delete({
            where: { id },
        });

        return Response.json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        return Response.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
