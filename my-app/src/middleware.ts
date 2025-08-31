import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
      if (!token) {
        return NextResponse.redirect(new URL("/Auth/Signin", req.url));
      }
      
      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/welcome", req.url));
      }
    }

    // Protect candidat routes
    if (pathname.startsWith("/candidat")) {
      if (!token) {
        return NextResponse.redirect(new URL("/Auth/Signin", req.url));
      }
      
      if (token.role !== "CANDIDAT") {
        return NextResponse.redirect(new URL("/welcome", req.url));
      }
    }

    // Protect enseignant routes
    if (pathname.startsWith("/enseignant")) {
      if (!token) {
        return NextResponse.redirect(new URL("/Auth/Signin", req.url));
      }
      
      if (token.role !== "ENSEIGNANT") {
        return NextResponse.redirect(new URL("/welcome", req.url));
      }
    }

    // Protect etudiant routes
    if (pathname.startsWith("/etudiant")) {
      if (!token) {
        return NextResponse.redirect(new URL("/Auth/Signin", req.url));
      }
      
      if (token.role !== "ETUDIANT") {
        return NextResponse.redirect(new URL("/welcome", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public routes
        if (
          pathname.startsWith("/Auth") ||
          pathname === "/" ||
          pathname === "/welcome" ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon.ico")
        ) {
          return true;
        }

        // For protected routes, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/candidat/:path*", 
    "/enseignant/:path*",
    "/etudiant/:path*",
    "/calendar/:path*",
    "/interviews/:path*"
  ]
};
