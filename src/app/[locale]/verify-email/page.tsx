"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

function VerifyEmailContent() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">(
    () => (token ? "loading" : "error")
  );

  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(async (res) => {
      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json();
        setStatus(data.error === "Lien expiré" ? "expired" : "error");
      }
    });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div style={{ border: "var(--rule)", background: "var(--card)" }}>
          <div style={{ background: "var(--ink)", padding: "1.5rem", textAlign: "center" }}>
            <h1 style={{ fontFamily: "var(--font-display, 'Bebas Neue'), cursive", fontSize: "2.8rem", color: "var(--bg)", letterSpacing: "0.06em", lineHeight: 1 }}>
              useqraft
            </h1>
            <p style={{ color: "rgba(240,235,225,0.5)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: "0.3rem", fontFamily: "var(--font-sans)" }}>
              {t("verify_email_title")}
            </p>
          </div>

          <div style={{ padding: "1.5rem", textAlign: "center" }}>
            {status === "loading" && (
              <p style={{ color: "var(--mid)", fontSize: "0.85rem" }}>...</p>
            )}
            {status === "success" && (
              <>
                <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid #10b981", color: "#10b981", padding: "0.75rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  {t("verify_email_success")}
                </div>
                <Link href="/login" className="btn btn-primary" style={{ display: "inline-block" }}>
                  {t("sign_in")}
                </Link>
              </>
            )}
            {(status === "error" || status === "expired") && (
              <>
                <div style={{ background: "rgba(212,41,15,0.06)", border: "1px solid var(--red)", color: "var(--red)", padding: "0.75rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  {status === "expired" ? t("verify_email_expired") : t("verify_email_error")}
                </div>
                <Link href="/login" style={{ fontSize: "0.75rem", color: "var(--ink)", fontWeight: 700, textDecoration: "underline" }}>
                  {t("back_to_login")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}><span style={{ fontFamily: "var(--font-display, cursive)", fontSize: "1.5rem", color: "var(--mid)" }}>...</span></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
