import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Next.js 16: konvensi "middleware" berganti nama jadi "proxy" (runtime nodejs,
// edge tidak didukung). Proteksi /admin/* memakai callback `authorized`
// di auth.config.ts.
//
// Ini hanya lapis pertama (optimistic check): layout panel admin dan setiap
// Route Handler tetap memeriksa sesi sendiri, jadi tidak ada rute yang
// bergantung pada proxy saja.
const { auth } = NextAuth(authConfig);

export const proxy = auth;

export default proxy;

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
