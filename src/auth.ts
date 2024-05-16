import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { type NextAuthConfig,type DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db/schema";

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's id. */
      id: string
    } & DefaultSession['user']
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code"
      }
    },
  })],
  basePath: "/api/auth",
  pages: {
    signIn: "/",
  },
  callbacks: {
    jwt({ token, profile }) {
      if (profile) {
        token.id = profile.sub
        token.image = profile.picture
      }
      return token
    },
    session: ({ session, token }) => {
      if (session?.user && token?.id) {
        session.user.id = String(token.id)
      }
      return session
    },
    authorized: ({ request: { nextUrl }, auth: midAuth }) => {
      const isLoggedIn = Boolean(midAuth?.user);
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard) {
        // Redirect unauthenticated users to the login page
        return isLoggedIn;
      } else if (isLoggedIn) {
        // Redirect authenticated users to the dashboard
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Allow unauthenticated users to access other pages
      return true;
    },
  },
} satisfies NextAuthConfig);
