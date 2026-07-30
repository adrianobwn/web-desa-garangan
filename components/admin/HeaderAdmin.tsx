export function HeaderAdmin({
  judul,
  sub,
  aksi,
}: {
  judul: string;
  sub?: string;
  aksi?: React.ReactNode;
}) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 24,
        padding: "24px 40px",
        borderBottom: "2px solid var(--color-divider)",
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1 style={{ fontSize: 26, margin: 0, letterSpacing: "-0.01em" }}>
          {judul}
        </h1>
        {sub && (
          <p
            style={{
              fontSize: 13.5,
              color: "var(--color-neutral-700)",
              margin: "4px 0 0",
            }}
          >
            {sub}
          </p>
        )}
      </div>
      {aksi && (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {aksi}
        </div>
      )}
    </header>
  );
}
