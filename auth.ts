import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validasi";

const BATAS_PERCOBAAN = 5;
const JENDELA_MENIT = 15;

class LoginGagal extends CredentialsSignin {
  code = "kredensial_salah";
}
class TerlaluBanyak extends CredentialsSignin {
  code = "terlalu_banyak_percobaan";
}

/** Rate-limit login per (username + IP): 5 percobaan / 15 menit. */
async function cekRateLimit(kunci: string) {
  const sejak = new Date(Date.now() - JENDELA_MENIT * 60_000);
  const jumlah = await prisma.loginAttempt.count({
    where: { kunci, createdAt: { gte: sejak } },
  });
  if (jumlah >= BATAS_PERCOBAAN) throw new TerlaluBanyak();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { username: {}, password: {} },
      async authorize(kredensial, request) {
        const parsed = loginSchema.safeParse(kredensial);
        if (!parsed.success) throw new LoginGagal();
        const { username, password } = parsed.data;

        const ip =
          request?.headers?.get("x-forwarded-for")?.split(",")[0].trim() ??
          "unknown";
        const kunci = `${username}|${ip}`;
        await cekRateLimit(kunci);

        const user = await prisma.user.findUnique({ where: { username } });

        // Selalu jalankan bcrypt walau user tidak ada — samakan waktu respons
        // supaya username yang valid tidak bisa ditebak dari timing.
        const hash =
          user?.passwordHash ??
          "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidiu";
        const cocok = await bcrypt.compare(password, hash);

        if (!user || !cocok) {
          await prisma.loginAttempt.create({ data: { kunci } });
          await prisma.auditLog.create({
            data: {
              aksi: "LOGIN_GAGAL",
              entitas: "User",
              ringkasan: `Percobaan login gagal untuk "${username}"`,
              ip,
              userId: user?.id ?? null,
            },
          });
          throw new LoginGagal();
        }

        // Login sukses — bersihkan hitungan percobaan.
        await prisma.loginAttempt.deleteMany({ where: { kunci } });
        await prisma.auditLog.create({
          data: {
            aksi: "LOGIN",
            entitas: "User",
            entitasId: user.id,
            ringkasan: `${user.nama} masuk ke panel admin`,
            ip,
            userId: user.id,
          },
        });

        return {
          id: user.id,
          name: user.nama,
          email: user.username,
          role: user.role,
        };
      },
    }),
  ],
});
