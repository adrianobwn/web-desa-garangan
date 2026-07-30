"use client";

import { useState } from "react";

export function FormKontak() {
  const [status, setStatus] = useState<"idle" | "kirim" | "ok" | "gagal">("idle");
  const [pesan, setPesan] = useState("");

  async function kirim(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("kirim");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/kontak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setPesan(
          json.detail?.[0]?.pesan ?? json.error ?? "Pesan gagal dikirim",
        );
        setStatus("gagal");
        return;
      }
      e.currentTarget.reset();
      setStatus("ok");
    } catch {
      setPesan("Tidak dapat menghubungi server. Coba lagi.");
      setStatus("gagal");
    }
  }

  return (
    <form onSubmit={kirim} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="field">
        <label htmlFor="k-nama">Nama lengkap</label>
        <input
          id="k-nama"
          name="nama"
          className="input"
          type="text"
          required
          placeholder="Nama sesuai KTP"
        />
      </div>
      <div className="field">
        <label htmlFor="k-wa">Nomor WhatsApp</label>
        {/* inputMode numerik + saring huruf saat mengetik. Validasi server
            (Zod) tetap jalan — ini hanya membantu pengisi form. */}
        <input
          id="k-wa"
          name="whatsapp"
          className="input"
          type="tel"
          required
          inputMode="numeric"
          autoComplete="tel"
          maxLength={16}
          pattern="^(\+62|62|0)8[1-9][0-9]{6,11}$"
          title="Contoh: 081234567890"
          placeholder="08xx-xxxx-xxxx"
          onInput={(e) => {
            const el = e.currentTarget;
            // Izinkan angka, dan "+" hanya di posisi pertama.
            const bersih = el.value
              .replace(/[^\d+]/g, "")
              .replace(/(?!^)\+/g, "");
            if (el.value !== bersih) el.value = bersih;
          }}
        />
      </div>
      <div className="field">
        <label htmlFor="k-pesan">Pesan</label>
        <textarea
          id="k-pesan"
          name="pesan"
          className="input"
          rows={4}
          required
          placeholder="Tulis pertanyaan atau aduan Anda"
        />
      </div>
      {/* Honeypot — disembunyikan dari manusia, diisi bot. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px" }}
      />
      <div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === "kirim"}
        >
          {status === "kirim" ? "Mengirim…" : "Kirim pesan"}
        </button>
      </div>
      <p aria-live="polite" style={{ fontSize: 12.5, margin: 0, color: "var(--color-neutral-700)" }}>
        {status === "ok" ? (
          <span style={{ color: "var(--color-accent-700)", fontWeight: 600 }}>
            Pesan terkirim. Perangkat desa akan membalas maksimal 2 hari kerja.
          </span>
        ) : status === "gagal" ? (
          <span style={{ color: "#a11", fontWeight: 600 }}>{pesan}</span>
        ) : (
          "Pesan masuk ke perangkat desa dan dibalas maksimal 2 hari kerja."
        )}
      </p>
    </form>
  );
}
