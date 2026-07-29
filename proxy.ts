import { auth } from "@/auth"
import { NextRequest } from "next/server"

export const proxy = async (req: NextRequest) => {
    const session = await auth()
    if (!session && req.nextUrl.pathname.startsWith("/documents")) {
        return Response.redirect(new URL("/", req.nextUrl.origin))
    }
}

export const config = {
    matcher: ["/documents/:path*"],
}