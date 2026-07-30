"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const PESAN: Record<string, string> = {
  kredensial_salah: "Nama pengguna atau kata sandi salah.",
  terlalu_banyak_percobaan:
    "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
  CredentialsSignin: "Nama pengguna atau kata sandi salah.",
};

export function FormLogin({ errorAwal }: { errorAwal?: string }) {
  const router = useRouter();
  const [error, setError] = useState(
    errorAwal ? (PESAN[errorAwal] ?? "Gagal masuk.") : "",
  );
  const [sibuk, setSibuk] = useState(false);

  async function kirim(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSibuk(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const hasil = await signIn("credentials", {
      username: String(fd.get("username") ?? ""),
      password: String(fd.get("password") ?? ""),
      redirect: false,
    });

    if (hasil?.error) {
      setError(PESAN[hasil.code ?? hasil.error] ?? "Gagal masuk.");
      setSibuk(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={kirim}>
      <div className="field" style={{ marginTop: 40 }}>
        <label htmlFor="username">Nama pengguna</label>
        <input
          id="username"
          name="username"
          className="input"
          type="text"
          required
          autoComplete="username"
          placeholder="admin.garangan"
        />
      </div>
      <div className="field" style={{ marginTop: 16 }}>
        <label htmlFor="password">Kata sandi</label>
        <input
          id="password"
          name="password"
          className="input"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p
          role="alert"
          style={{
            fontSize: 13,
            color: "#a11",
            fontWeight: 600,
            margin: "14px 0 0",
          }}
        >
          {error}
        </p>
      )}

      <p
        style={{
          fontSize: 13.5,
          color: "var(--color-neutral-700)",
          margin: "14px 0 0",
        }}
      >
        Lupa kata sandi? Hubungi sekretaris desa untuk penyetelan ulang.
      </p>

      <button
        type="submit"
        className="btn btn-primary btn-block"
        style={{ marginTop: 24 }}
        disabled={sibuk}
      >
        {sibuk ? "Memproses…" : "Masuk ke Dashboard"}
      </button>
    </form>
  );
}
