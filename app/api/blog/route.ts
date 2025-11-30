import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET - Fetch blog posts
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const slug = searchParams.get("slug");
        const published = searchParams.get("published");
        const tag = searchParams.get("tag");

        if (id) {
            // Fetch single blog post by ID
            const post = await prisma.blogPost.findUnique({
                where: { id },
            });

            if (!post) {
                return Response.json(
                    { success: false, error: "Blog post not found" },
                    { status: 404 }
                );
            }

            return Response.json({ success: true, data: post });
        }

        if (slug) {
            // Fetch single blog post by slug
            const post = await prisma.blogPost.findUnique({
                where: { slug },
            });

            if (!post) {
                return Response.json(
                    { success: false, error: "Blog post not found" },
                    { status: 404 }
                );
            }

            return Response.json({ success: true, data: post });
        }

        // Build filter conditions
        const where: any = {};

        if (published !== null) {
            where.published = published === "true";
        }

        if (tag) {
            where.tags = { has: tag };
        }

        // Fetch all blog posts with optional filters
        const posts = await prisma.blogPost.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        return Response.json({ success: true, data: posts });
    } catch (error) {
        console.error("Error fetching blog post(s):", error);
        return Response.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

// POST - Create new blog post
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, content, summary, coverImage, tags, published } = body;

        if (!title || !content) {
            return Response.json(
                { success: false, error: "Title and content are required" },
                { status: 400 }
            );
        }

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        // Check if slug already exists
        const existingPost = await prisma.blogPost.findUnique({
            where: { slug },
        });

        if (existingPost) {
            return Response.json(
                { success: false, error: "A post with this title already exists" },
                { status: 409 }
            );
        }

        const post = await prisma.blogPost.create({
            data: {
                title,
                slug,
                content,
                summary,
                coverImage,
                tags: tags || [],
                published: published || false,
                publishedAt: published ? new Date() : null,
            },
        });

        return Response.json({ success: true, data: post });
    } catch (error) {
        console.error("Error creating blog post:", error);
        return Response.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

// PUT - Update existing blog post
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, title, content, summary, coverImage, tags, published } = body;

        if (!id) {
            return Response.json(
                { success: false, error: "Blog post ID is required" },
                { status: 400 }
            );
        }

        // Check if post exists
        const existingPost = await prisma.blogPost.findUnique({
            where: { id },
        });

        if (!existingPost) {
            return Response.json(
                { success: false, error: "Blog post not found" },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData: any = {};

        if (title !== undefined) {
            updateData.title = title;
            // Regenerate slug if title changed
            updateData.slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
        }

        if (content !== undefined) updateData.content = content;
        if (summary !== undefined) updateData.summary = summary;
        if (coverImage !== undefined) updateData.coverImage = coverImage;
        if (tags !== undefined) updateData.tags = tags;

        // Handle published status
        if (published !== undefined) {
            updateData.published = published;
            // Set publishedAt when publishing for the first time
            if (published && !existingPost.published) {
                updateData.publishedAt = new Date();
            }
        }

        const post = await prisma.blogPost.update({
            where: { id },
            data: updateData,
        });

        return Response.json({ success: true, data: post });
    } catch (error) {
        console.error("Error updating blog post:", error);
        return Response.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

// DELETE - Delete blog post
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return Response.json(
                { success: false, error: "Blog post ID is required" },
                { status: 400 }
            );
        }

        // Check if post exists
        const post = await prisma.blogPost.findUnique({
            where: { id },
        });

        if (!post) {
            return Response.json(
                { success: false, error: "Blog post not found" },
                { status: 404 }
            );
        }

        await prisma.blogPost.delete({
            where: { id },
        });

        return Response.json({ success: true, message: "Blog post deleted successfully" });
    } catch (error) {
        console.error("Error deleting blog post:", error);
        return Response.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
