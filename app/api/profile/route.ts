import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET /api/profile
// Scoped - Returns profiles created by the authenticated user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        const session = await auth()

        // If ID is provided, return specific profile
        if (id) {
            const profile = await prisma.profile.findUnique({
                where: { id },
                include: { social: true },
            })

            if (!profile) {
                return NextResponse.json(
                    { success: false, error: "Profile not found" },
                    { status: 404 }
                )
            }

            return NextResponse.json({ success: true, data: profile })
        }

        // List view - Scoped to authenticated user
        if (!session || !session.user?.id) {
            return NextResponse.json({ success: true, data: [] })
        }

        const profiles = await prisma.profile.findMany({
            where: {
                userId: session.user.id
            },
            include: { social: true },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ success: true, data: profiles })
    } catch (error) {
        console.error("Failed to fetch profiles:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch profiles" },
            { status: 500 }
        )
    }
}

// POST /api/profile
// Protected - Create a new profile for the authenticated user
export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { fullName, tagline, bio, email, social } = body

        if (!fullName) {
            return NextResponse.json(
                { success: false, error: "Full Name is required" },
                { status: 400 }
            )
        }

        // Create profile linked to user
        const profile = await prisma.profile.create({
            data: {
                fullName,
                tagline,
                bio,
                email,
                userId: session.user.id, // Link to user
                social: {
                    create: {
                        github: social?.github,
                        linkedin: social?.linkedin,
                        twitter: social?.twitter,
                    },
                },
            },
            include: { social: true },
        })

        return NextResponse.json({ success: true, data: profile }, { status: 201 })
    } catch (error) {
        console.error("Failed to create profile:", error)
        return NextResponse.json(
            { success: false, error: "Failed to create profile" },
            { status: 500 }
        )
    }
}

// PUT /api/profile
// Protected - Update a profile (must belong to user)
export async function PUT(request: Request) {
    try {
        const session = await auth()

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { id, fullName, tagline, bio, email, social } = body

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Profile ID is required" },
                { status: 400 }
            )
        }

        // Verify ownership
        const existingProfile = await prisma.profile.findUnique({
            where: { id },
        })

        if (!existingProfile) {
            return NextResponse.json(
                { success: false, error: "Profile not found" },
                { status: 404 }
            )
        }

        if (existingProfile.userId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: "Forbidden: You do not own this profile" },
                { status: 403 }
            )
        }

        const updatedProfile = await prisma.profile.update({
            where: { id },
            data: {
                fullName,
                tagline,
                bio,
                email,
                social: {
                    upsert: {
                        create: {
                            github: social?.github,
                            linkedin: social?.linkedin,
                            twitter: social?.twitter,
                        },
                        update: {
                            github: social?.github,
                            linkedin: social?.linkedin,
                            twitter: social?.twitter,
                        },
                    },
                },
            },
            include: { social: true },
        })

        return NextResponse.json({ success: true, data: updatedProfile })
    } catch (error) {
        console.error("Failed to update profile:", error)
        return NextResponse.json(
            { success: false, error: "Failed to update profile" },
            { status: 500 }
        )
    }
}

// DELETE /api/profile
// Protected - Delete a profile (must belong to user)
export async function DELETE(request: Request) {
    try {
        const session = await auth()

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Profile ID is required" },
                { status: 400 }
            )
        }

        // Verify ownership
        const existingProfile = await prisma.profile.findUnique({
            where: { id },
        })

        if (!existingProfile) {
            return NextResponse.json(
                { success: false, error: "Profile not found" },
                { status: 404 }
            )
        }

        if (existingProfile.userId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: "Forbidden: You do not own this profile" },
                { status: 403 }
            )
        }

        // Delete social first
        await prisma.social.deleteMany({
            where: { profileId: id }
        })

        await prisma.profile.delete({
            where: { id },
        })

        return NextResponse.json({ success: true, message: "Profile deleted" })
    } catch (error) {
        console.error("Failed to delete profile:", error)
        return NextResponse.json(
            { success: false, error: "Failed to delete profile" },
            { status: 500 }
        )
    }
}
