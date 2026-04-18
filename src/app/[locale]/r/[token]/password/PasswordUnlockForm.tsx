"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

interface Props {
  token: string;
}

export const PasswordUnlockForm = ({ token }: Props) => {
  const t = useTranslations("dashboard.password");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/r/${token}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (res.ok && data?.ok) {
        window.location.href = `/r/${token}`;
        return;
      }
      setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 6vw, 4rem)",
          letterSpacing: "0.04em",
          color: "var(--ink)",
          marginBottom: "1rem",
          lineHeight: 1,
        }}
      >
        {t("unlock_title")}
      </h1>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.95rem",
          color: "var(--mid)",
          maxWidth: "36ch",
          margin: "0 auto 2rem",
        }}
      >
        {t("unlock_subtitle")}
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 380,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.9rem",
        }}
      >
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          autoFocus
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.9rem 1rem",
            background: "var(--bg)",
            border: error ? "2px solid var(--red)" : "2px solid var(--ink)",
            borderRadius: 0,
            fontFamily: "var(--font-mono)",
            fontSize: "0.9rem",
            color: "var(--ink)",
            outline: "none",
            textAlign: "center",
            letterSpacing: "0.15em",
          }}
        />

        {error && (
          <p
            style={{
              color: "var(--red)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: 0,
            }}
          >
            {t("wrong_password")}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password.trim()}
          style={{
            background: "var(--red)",
            color: "white",
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0.95rem 2rem",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading || !password.trim() ? 0.6 : 1,
          }}
        >
          {loading ? "…" : t("unlock_cta")}
        </button>
      </form>
    </>
  );
};
