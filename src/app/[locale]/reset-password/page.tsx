"use client";

import { FormEvent, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.65rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--mid)",
  marginBottom: "0.4rem",
};

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t("password_too_short"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("passwords_mismatch"));
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      const data = await res.json();
      setError(data.error ?? t("error_generic"));
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-sm" style={{ border: "var(--rule)", background: "var(--card)", padding: "1.5rem", textAlign: "center" }}>
          <p style={{ color: "var(--red)", fontSize: "0.85rem" }}>{t("reset_link_invalid")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-4">
          <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--mid)", textDecoration: "none" }}>
            {t("back")}
          </Link>
        </div>

        <div style={{ border: "var(--rule)", background: "var(--card)" }}>
          <div style={{ background: "var(--ink)", padding: "1.5rem", textAlign: "center" }}>
            <h1 style={{ fontFamily: "var(--font-display, 'Bebas Neue'), cursive", fontSize: "2.8rem", color: "var(--bg)", letterSpacing: "0.06em", lineHeight: 1 }}>
              QRaft
            </h1>
            <p style={{ color: "rgba(240,235,225,0.5)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: "0.3rem", fontFamily: "var(--font-sans)" }}>
              {t("reset_password_subtitle")}
            </p>
          </div>

          <div style={{ padding: "1.5rem" }}>
            {success ? (
              <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid #10b981", color: "#10b981", padding: "0.75rem", fontSize: "0.85rem", textAlign: "center" }}>
                {t("reset_success")}
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 text-sm" style={{ background: "rgba(212,41,15,0.06)", border: "1px solid var(--red)", color: "var(--red)" }}>
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="password" style={labelStyle}>{t("new_password")}</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder={t("password_placeholder")} required minLength={6} />
                  </div>
                  <div>
                    <label htmlFor="confirm" style={labelStyle}>{t("password_confirm")}</label>
                    <input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" placeholder="••••••••" required minLength={6} />
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: "0.5rem" }}>
                    {loading ? t("saving") : t("reset_password_button")}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}><span style={{ fontFamily: "var(--font-display, cursive)", fontSize: "1.5rem", color: "var(--mid)" }}>...</span></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
