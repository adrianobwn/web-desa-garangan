import type { NextAuthConfig } from "next-auth";

/**
 * Konfigurasi ringan tanpa Prisma/bcrypt — dipakai middleware (Edge runtime).
 * Provider yang butuh Node.js ada di auth.ts.
 */
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8 jam kerja
  trustHost: true,
  callbacks: {
    // Middleware memakai ini untuk memproteksi /admin/*.
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const sudahLogin = !!auth?.user;
      if (pathname === "/admin/login") return true;
      if (pathname.startsWith("/admin")) return sudahLogin;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // diisi di auth.ts
} satisfies NextAuthConfig;
