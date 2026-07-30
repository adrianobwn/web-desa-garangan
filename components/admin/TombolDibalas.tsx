"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TombolDibalas({
  id,
  dibalas,
}: {
  id: string;
  dibalas: boolean;
}) {
  const router = useRouter();
  const [sibuk, setSibuk] = useState(false);

  async function ubah() {
    setSibuk(true);
    await fetch(`/api/pesan/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusDibalas: !dibalas }),
    });
    setSibuk(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      className={`btn ${dibalas ? "btn-secondary" : "btn-primary"}`}
      onClick={ubah}
      disabled={sibuk}
    >
      {dibalas ? "Tandai belum dibalas" : "Tandai sudah dibalas"}
    </button>
  );
}
