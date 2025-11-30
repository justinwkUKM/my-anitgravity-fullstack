import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req

    // Allow public access to auth routes and contact API
    if (nextUrl.pathname.startsWith("/api/auth") || nextUrl.pathname.startsWith("/api/contact")) {
        return
    }

    // Allow public access to GET requests for blog, project, and profile
    if ((nextUrl.pathname.startsWith("/api/blog") || nextUrl.pathname.startsWith("/api/project") || nextUrl.pathname.startsWith("/api/profile")) && req.method === "GET") {
        return
    }

    // Protect all other API routes
    if (nextUrl.pathname.startsWith("/api")) {
        if (!isLoggedIn) {
            return Response.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }
    }
})

export const config = {
    matcher: ["/api/:path*"],
}
