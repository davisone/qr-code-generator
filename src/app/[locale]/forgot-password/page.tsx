"use client";

import { FormEvent, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.65rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--mid)",
  marginBottom: "0.4rem",
};

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale }),
    });

    setLoading(false);

    if (res.ok) {
      setSent(true);
    } else {
      setError(t("error_generic"));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--mid)", textDecoration: "none" }}
          >
            {t("back")}
          </Link>
        </div>

        <div style={{ border: "var(--rule)", background: "var(--card)" }}>
          <div style={{ background: "var(--ink)", padding: "1.5rem", textAlign: "center" }}>
            <h1
              style={{
                fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
                fontSize: "2.8rem",
                color: "var(--bg)",
                letterSpacing: "0.06em",
                lineHeight: 1,
              }}
            >
              QRaft
            </h1>
            <p
              style={{
                color: "rgba(240,235,225,0.5)",
                fontSize: "0.62rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                marginTop: "0.3rem",
                fontFamily: "var(--font-sans)",
              }}
            >
              {t("forgot_password_subtitle")}
            </p>
          </div>

          <div style={{ padding: "1.5rem" }}>
            {sent ? (
              <div style={{ textAlign: "center" }}>
                <div
                  className="mb-4 p-3 text-sm"
                  style={{ background: "rgba(16,185,129,0.08)", border: "1px solid #10b981", color: "#10b981" }}
                >
                  {t("reset_link_sent")}
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--mid)", marginTop: "1rem" }}>
                  <Link href="/login" style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "underline" }}>
                    {t("back_to_login")}
                  </Link>
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div
                    className="mb-4 p-3 text-sm"
                    style={{ background: "rgba(212,41,15,0.06)", border: "1px solid var(--red)", color: "var(--red)" }}
                  >
                    {error}
                  </div>
                )}
                <p style={{ fontSize: "0.78rem", color: "var(--mid)", marginBottom: "1.25rem", fontFamily: "var(--font-sans)" }}>
                  {t("forgot_password_desc")}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" style={labelStyle}>{t("email")}</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      placeholder={t("email_placeholder")}
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: "0.5rem" }}>
                    {loading ? t("sending") : t("send_reset_link")}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
