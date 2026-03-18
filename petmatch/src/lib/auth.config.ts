import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Credentials is declared here for the middleware to know about it,
    // but the actual authorize logic is in auth.ts
    Credentials({}),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as
          | "OWNER"
          | "WALKER"
          | "VET"
          | "CLINIC"
          | "ADMIN";
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const publicRoutes = ["/", "/signin", "/signup", "/forgot-password", "/reset-password"];
      const isPublic =
        publicRoutes.some((route) => pathname === route) ||
        pathname.startsWith("/adoption") ||
        pathname.startsWith("/services") ||
        pathname.startsWith("/vets") ||
        pathname.startsWith("/marketplace") ||
        pathname.startsWith("/providers") ||
        pathname.startsWith("/lost-pets") ||
        pathname.startsWith("/teleconsulta") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/webhooks");

      if (isPublic) return true;
      if (!isLoggedIn) return false;

      const role = auth?.user?.role;
      if (pathname.startsWith("/admin") && role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (pathname.startsWith("/provider") && role !== "WALKER" && role !== "VET" && role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (pathname.startsWith("/clinic") && role !== "CLINIC" && role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
};
