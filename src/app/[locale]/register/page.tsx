"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Link } from "@/i18n/navigation";
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

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  async function handleOAuthSignIn(provider: "google" | "github") {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl: "/dashboard" });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError(t("fill_fields"));
      return;
    }

    if (password.length < 6) {
      setError(t("password_too_short"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwords_mismatch"));
      return;
    }

    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      name,
      action: "register",
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors"
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
              {t("register_subtitle")}
            </p>
          </div>

          <div style={{ padding: "1.5rem" }}>
            {error && (
              <div
                className="mb-4 p-3 text-sm"
                style={{ background: "rgba(212,41,15,0.06)", border: "1px solid var(--red)", color: "var(--red)" }}
              >
                {error}
              </div>
            )}

            <div className="space-y-2 mb-5">
              <button
                type="button"
                onClick={() => handleOAuthSignIn("google")}
                disabled={oauthLoading !== null}
                className="w-full flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest"
                style={{
                  padding: "0.65rem",
                  background: "white",
                  border: "var(--rule-thin)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  opacity: oauthLoading !== null ? 0.5 : 1,
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {oauthLoading === "google" ? t("registering") : t("google")}
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignIn("github")}
                disabled={oauthLoading !== null}
                className="w-full flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest"
                style={{
                  padding: "0.65rem",
                  background: "#24292e",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  opacity: oauthLoading !== null ? 0.5 : 1,
                }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                {oauthLoading === "github" ? t("registering") : t("github")}
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div style={{ flex: 1, height: 1, borderTop: "var(--rule-thin)" }} />
              <span style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--light)", fontFamily: "var(--font-sans)" }}>{t("or")}</span>
              <div style={{ flex: 1, height: 1, borderTop: "var(--rule-thin)" }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" style={labelStyle}>{t("name")}</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder={t("name_placeholder")} required />
              </div>
              <div>
                <label htmlFor="email" style={labelStyle}>{t("email")}</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder={t("email_placeholder")} required />
              </div>
              <div>
                <label htmlFor="password" style={labelStyle}>{t("password")}</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder={t("password_placeholder")} required minLength={6} />
              </div>
              <div>
                <label htmlFor="confirmPassword" style={labelStyle}>{t("password_confirm")}</label>
                <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" placeholder="••••••••" required minLength={6} />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: "0.5rem" }}>
                {loading ? t("register_loading") : t("register_button")}
              </button>
            </form>

            <p className="mt-5 text-center" style={{ fontSize: "0.75rem", color: "var(--mid)" }}>
              {t("has_account")}{" "}
              <Link href="/login" style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "underline" }}>
                {t("sign_in")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
