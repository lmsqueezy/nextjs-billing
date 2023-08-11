import { getToken } from "next-auth/jwt"
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req })
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith("/login")

    // Redirect auth pages (/login) to dashboard when logged in
    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }

      return null
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      // Load the homepage (/home) at / when not logged in
      if (req.nextUrl.pathname == '/') {
        return NextResponse.rewrite(new URL('/', req.url));
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    } else {
      // Redirect / to /dashboard when logged in
      // if (req.nextUrl.pathname == '/') {
      //   return NextResponse.redirect(new URL('/dashboard', req.url));
      // }
    }
  },
  {
    callbacks: {
      async authorized() {
        // This is a work-around for handling redirect on auth pages.
        // We return true here so that the middleware function above
        // is always called.
        return true
      },
    },
  }
)

export const config = {
  // /login + all locked pages should be listed here
  matcher: [
    '/',
    '/dashboard',
    '/billing',
    '/login'
  ],
}
