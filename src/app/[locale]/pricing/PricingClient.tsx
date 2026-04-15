"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface Props {
  isPro: boolean;
  hasStripeCustomer: boolean;
  isLoggedIn: boolean;
}

const CHECK_FREE = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M3 8l3.5 3.5L13 4.5" stroke="var(--mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CHECK_PRO = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M3 8l3.5 3.5L13 4.5" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CROSS_FREE = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M5 5l6 6M11 5l-6 6" stroke="var(--mid)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
  </svg>
);

export const PricingClient = ({ isPro, hasStripeCustomer, isLoggedIn }: Props) => {
  const t = useTranslations("pricing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) throw new Error("checkout_failed");
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
      else throw new Error("no_url");
    } catch {
      setError(t("error_generic"));
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) throw new Error("portal_failed");
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
      else throw new Error("no_url");
    } catch {
      setError(t("error_generic"));
    } finally {
      setLoading(false);
    }
  };

  const freeFeatures: Array<{ key: string; included: boolean }> = [
    { key: "feature_create", included: true },
    { key: "feature_customize", included: true },
    { key: "feature_export", included: true },
    { key: "feature_share", included: true },
    { key: "feature_expire", included: false },
    { key: "feature_analytics_limited", included: true },
  ];

  const proFeatures: Array<{ key: string }> = [
    { key: "feature_create" },
    { key: "feature_customize" },
    { key: "feature_export" },
    { key: "feature_share" },
    { key: "feature_no_expire" },
    { key: "feature_analytics_full" },
  ];

  const faqItems = [
    { q: "faq_1_q", a: "faq_1_a" },
    { q: "faq_2_q", a: "faq_2_a" },
    { q: "faq_3_q", a: "faq_3_a" },
    { q: "faq_4_q", a: "faq_4_a" },
  ];

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "6rem 1.5rem 5rem" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "var(--red)",
            marginBottom: "1rem",
          }}
        >
          {t("label")}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 8vw, 6rem)",
            letterSpacing: "0.03em",
            color: "var(--ink)",
            lineHeight: 1,
            marginBottom: "1.25rem",
          }}
        >
          {t("title")}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1rem",
            color: "var(--mid)",
            maxWidth: "46ch",
            margin: "0 auto",
          }}
        >
          {t("subtitle")}
        </p>
      </div>

      {/* Grid plans */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          border: "var(--rule)",
          marginBottom: "5rem",
        }}
      >
        {/* Plan Free */}
        <div
          style={{
            background: "var(--bg)",
            padding: "2.5rem",
            borderRight: "var(--rule)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "var(--mid)",
              marginBottom: "0.75rem",
            }}
          >
            {t("free_label")}
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              color: "var(--ink)",
              lineHeight: 1,
              marginBottom: "0.5rem",
            }}
          >
            0€
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              color: "var(--mid)",
              marginBottom: "2rem",
            }}
          >
            {t("free_hint")}
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2.5rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {freeFeatures.map(({ key, included }) => (
              <li
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: included ? "var(--ink)" : "var(--mid)",
                  opacity: included ? 1 : 0.55,
                }}
              >
                {included ? CHECK_FREE : CROSS_FREE}
                {t(key)}
              </li>
            ))}
          </ul>

          {isLoggedIn ? (
            <Link
              href="/dashboard"
              style={{
                display: "block",
                textAlign: "center",
                border: "var(--rule)",
                color: "var(--ink)",
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "0.9rem 1.5rem",
                textDecoration: "none",
              }}
            >
              {t("cta_dashboard")}
            </Link>
          ) : (
            <Link
              href="/register"
              style={{
                display: "block",
                textAlign: "center",
                border: "var(--rule)",
                color: "var(--ink)",
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "0.9rem 1.5rem",
                textDecoration: "none",
              }}
            >
              {t("cta_register")}
            </Link>
          )}
        </div>

        {/* Plan Pro */}
        <div
          style={{
            background: "var(--ink)",
            padding: "2.5rem",
            color: "#f0ebe1",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "var(--red)",
              marginBottom: "0.75rem",
            }}
          >
            {t("pro_label")}
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              color: "#f0ebe1",
              lineHeight: 1,
              marginBottom: "0.5rem",
            }}
          >
            9,99€
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              color: "var(--red)",
              marginBottom: "2rem",
            }}
          >
            {t("annual_hint")}
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2.5rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {proFeatures.map(({ key }) => (
              <li
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "#f0ebe1",
                }}
              >
                {CHECK_PRO}
                {t(key)}
              </li>
            ))}
          </ul>

          {isPro ? (
            <button
              onClick={handlePortal}
              disabled={loading}
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
                background: "transparent",
                border: "1px solid rgba(240,235,225,0.35)",
                color: "#f0ebe1",
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "0.9rem 1.5rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? t("loading") : t("cta_portal")}
            </button>
          ) : isLoggedIn ? (
            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
                background: "var(--red)",
                border: "1px solid var(--red)",
                color: "#f0ebe1",
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "0.9rem 1.5rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? t("loading") : t("cta_upgrade")}
            </button>
          ) : (
            <Link
              href="/register"
              style={{
                display: "block",
                textAlign: "center",
                background: "var(--red)",
                border: "1px solid var(--red)",
                color: "#f0ebe1",
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "0.9rem 1.5rem",
                textDecoration: "none",
              }}
            >
              {t("cta_register")}
            </Link>
          )}
        </div>
      </div>

      {error && (
        <p style={{
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          color: "var(--red)",
          marginTop: "1rem",
        }}>
          {error}
        </p>
      )}

      {/* FAQ */}
      <div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "var(--mid)",
            marginBottom: "2rem",
          }}
        >
          {t("faq_label")}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "0",
          }}
        >
          {faqItems.map(({ q, a }) => (
            <div
              key={q}
              style={{
                borderTop: "var(--rule)",
                padding: "1.75rem 1.25rem 1.75rem 0",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  color: "var(--ink)",
                  marginBottom: "0.6rem",
                  letterSpacing: "0.01em",
                }}
              >
                {t(q)}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  color: "var(--mid)",
                  lineHeight: 1.65,
                }}
              >
                {t(a)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};
