"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        gap: "1.5rem",
        fontFamily: "var(--font-sans)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 5vw, 4rem)",
          color: "var(--ink)",
          letterSpacing: "0.02em",
          margin: 0,
        }}
      >
        OUPS.
      </h1>
      <p style={{ color: "var(--mid)", fontSize: "1rem", maxWidth: "40ch", textAlign: "center", lineHeight: 1.6 }}>
        Une erreur inattendue s&apos;est produite. Réessayez ou revenez à la page d&apos;accueil.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={reset}
          style={{
            background: "var(--red)",
            color: "white",
            border: "none",
            padding: "0.8rem 2rem",
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "0.78rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
        <a
          href="/"
          style={{
            border: "1px solid var(--rule-color, rgba(255,255,255,0.1))",
            color: "var(--ink)",
            padding: "0.8rem 2rem",
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "0.78rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            textDecoration: "none",
          }}
        >
          Accueil
        </a>
      </div>
    </div>
  );
}
