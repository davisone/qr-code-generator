"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Accordion } from "@/components/ui/Accordion";

interface Props {
  isPro: boolean;
  hasStripeCustomer: boolean;
  isLoggedIn: boolean;
}

const IconCheck = ({ dark }: { dark?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect width="16" height="16" fill={dark ? "var(--red)" : "var(--ink)"} opacity={dark ? 1 : 0.12} />
    <path d="M4 8l3 3 5-5" stroke={dark ? "white" : "var(--ink)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCross = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="var(--light)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const PricingClient = ({ isPro, hasStripeCustomer, isLoggedIn }: Props) => {
  const t = useTranslations("pricing");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthlyPrice = 9.99;
  const annualTotal = 86;
  const annualMonthly = (annualTotal / 12).toFixed(2);
  const savingsAmount = Math.round(monthlyPrice * 12 - annualTotal);

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

  // Tableau comparatif : [label, free, pro]
  const comparisonRows: Array<[string, boolean, boolean]> = [
    [t("feature_create"), true, true],
    [t("feature_customize"), true, true],
    [t("feature_export_png"), true, true],
    [t("feature_export_pdf_zip"), false, true],
    [t("feature_share"), true, true],
    [t("feature_expire"), false, true],
    [t("feature_analytics_limited"), true, true],
    [t("feature_analytics_full"), false, true],
    [t("feature_support"), false, true],
  ];

  const faqItems = [
    { q: t("pricing_faq_q1"), a: t("pricing_faq_a1") },
    { q: t("pricing_faq_q2"), a: t("pricing_faq_a2") },
    { q: t("pricing_faq_q3"), a: t("pricing_faq_a3") },
    { q: t("pricing_faq_q4"), a: t("pricing_faq_a4") },
    { q: t("pricing_faq_q5"), a: t("pricing_faq_a5") },
  ];

  return (
    <>
      <style>{`
        @keyframes border-spin {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .pro-card-wrapper {
          position: relative;
          padding: 2px;
          background: linear-gradient(90deg, var(--red), #f0b500, var(--red));
          background-size: 200% auto;
          animation: border-spin 3s linear infinite;
        }
        @media (max-width: 767px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
          .comparison-table { font-size: 0.75rem !important; }
        }
      `}</style>

      {/* ── HEADER ÉDITORIAL ── */}
      <div
        style={{
          borderBottom: "var(--rule)",
          padding: "clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 3rem) clamp(2.5rem, 5vw, 4rem)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              fontWeight: 700,
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
              fontSize: "clamp(3.5rem, 10vw, 8rem)",
              letterSpacing: "0.02em",
              color: "var(--ink)",
              lineHeight: 0.92,
              marginBottom: "1.5rem",
            }}
          >
            {t("title")}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              color: "var(--mid)",
              maxWidth: "50ch",
              lineHeight: 1.65,
              marginBottom: "2.5rem",
            }}
          >
            {t("subtitle")}
          </p>

          {/* Toggle mensuel / annuel */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              border: "var(--rule)",
              background: "var(--card)",
              padding: "0.25rem",
            }}
          >
            {(["monthly", "annual"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setBilling(mode)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.55rem 1.2rem",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  background: billing === mode ? "var(--ink)" : "transparent",
                  color: billing === mode ? "#f0ebe1" : "var(--mid)",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {mode === "monthly" ? t("billing_monthly") : t("billing_annual")}
                {mode === "annual" && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.58rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      padding: "0.15rem 0.4rem",
                      background: "var(--red)",
                      color: "white",
                    }}
                  >
                    {t("billing_save", { amount: savingsAmount })}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── GRILLE TARIFS ── */}
      <div style={{ borderBottom: "var(--rule)" }}>
        <div
          className="max-w-7xl mx-auto pricing-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          {/* Plan FREE */}
          <div
            style={{
              padding: "clamp(2rem, 4vw, 3.5rem)",
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
                marginBottom: "1rem",
              }}
            >
              {t("free_tier")}
            </p>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3rem, 7vw, 5rem)",
                color: "var(--ink)",
                lineHeight: 1,
                marginBottom: "0.35rem",
              }}
            >
              0€
            </div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--mid)",
                marginBottom: "2.5rem",
              }}
            >
              {t("free_hint")}
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 3rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {[
                { key: "feature_create", included: true },
                { key: "feature_customize", included: true },
                { key: "feature_export_png", included: true },
                { key: "feature_export_pdf_zip", included: false },
                { key: "feature_share", included: true },
                { key: "feature_expire_free", included: false },
                { key: "feature_analytics_limited", included: true },
              ].map(({ key, included }) => (
                <li
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    color: included ? "var(--ink)" : "var(--light)",
                  }}
                >
                  {included ? <IconCheck /> : <IconCross />}
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
                  padding: "1rem 1.5rem",
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
                  padding: "1rem 1.5rem",
                  textDecoration: "none",
                }}
              >
                {t("cta_register")}
              </Link>
            )}
          </div>

          {/* Plan PRO */}
          <div className="pro-card-wrapper">
            <div
              style={{
                background: "var(--ink)",
                padding: "clamp(2rem, 4vw, 3.5rem)",
                height: "100%",
              }}
            >
              {/* Badge populaire */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: "var(--red)",
                    margin: 0,
                  }}
                >
                  {t("pro_tier")}
                </p>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    padding: "0.25rem 0.6rem",
                    background: "var(--red)",
                    color: "white",
                  }}
                >
                  {t("popular_badge")}
                </span>
              </div>

              {/* Prix */}
              <div style={{ marginBottom: "0.35rem", display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(3rem, 7vw, 5rem)",
                    color: "#f0ebe1",
                    lineHeight: 1,
                  }}
                >
                  {billing === "monthly" ? `${monthlyPrice}€` : `${annualMonthly}€`}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    color: "rgba(240,235,225,0.5)",
                    marginBottom: "0.6rem",
                  }}
                >
                  /{t("month")}
                </span>
              </div>

              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: billing === "annual" ? "var(--yellow)" : "rgba(240,235,225,0.45)",
                  marginBottom: "2.5rem",
                }}
              >
                {billing === "annual"
                  ? `${annualTotal}€/${t("year")} — ${t("billing_save", { amount: savingsAmount })}`
                  : t("annual_hint")}
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 3rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {[
                  "feature_create",
                  "feature_customize",
                  "feature_export_png",
                  "feature_export_pdf_zip",
                  "feature_share",
                  "feature_no_expire",
                  "feature_analytics_full",
                  "feature_support",
                ].map((key) => (
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
                    <IconCheck dark />
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
                    padding: "1rem 1.5rem",
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
                    border: "none",
                    color: "white",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    padding: "1rem 1.5rem",
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
                    color: "white",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    padding: "1rem 1.5rem",
                    textDecoration: "none",
                  }}
                >
                  {t("cta_register")}
                </Link>
              )}

              {error && (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    color: "var(--red)",
                    marginTop: "0.75rem",
                    textAlign: "center",
                  }}
                >
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLEAU COMPARATIF ── */}
      <div style={{ borderBottom: "var(--rule)" }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ padding: "3rem clamp(1.5rem, 4vw, 3rem) 0" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                letterSpacing: "0.04em",
                color: "var(--ink)",
                marginBottom: "2rem",
              }}
            >
              {t("comparison_title")}
            </h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              className="comparison-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "var(--font-sans)",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "var(--rule)" }}>
                  <th
                    style={{
                      padding: "1rem clamp(1.5rem, 4vw, 3rem)",
                      textAlign: "left",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      color: "var(--mid)",
                    }}
                  >
                    {t("comparison_feature")}
                  </th>
                  <th
                    style={{
                      padding: "1rem 2rem",
                      textAlign: "center",
                      fontFamily: "var(--font-display)",
                      fontSize: "1.2rem",
                      letterSpacing: "0.06em",
                      color: "var(--ink)",
                    }}
                  >
                    {t("free_tier")}
                  </th>
                  <th
                    style={{
                      padding: "1rem 2rem",
                      textAlign: "center",
                      fontFamily: "var(--font-display)",
                      fontSize: "1.2rem",
                      letterSpacing: "0.06em",
                      color: "var(--red)",
                    }}
                  >
                    {t("pro_tier")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(([label, free, pro], i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: i < comparisonRows.length - 1 ? "var(--rule-thin)" : "none",
                      background: i % 2 === 0 ? "transparent" : "var(--card)",
                    }}
                  >
                    <td
                      style={{
                        padding: "0.9rem clamp(1.5rem, 4vw, 3rem)",
                        fontSize: "0.85rem",
                        color: "var(--ink)",
                      }}
                    >
                      {label}
                    </td>
                    <td style={{ padding: "0.9rem 2rem", textAlign: "center" }}>
                      {free ? <IconCheck /> : <IconCross />}
                    </td>
                    <td style={{ padding: "0.9rem 2rem", textAlign: "center" }}>
                      {pro ? <IconCheck dark /> : <IconCross />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── GARANTIE ── */}
      <div style={{ borderBottom: "var(--rule)", background: "var(--card)" }}>
        <div
          className="max-w-7xl mx-auto"
          style={{
            padding: "clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)",
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          {/* Icône garantie */}
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "var(--ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" fill="#f0ebe1" />
              <path d="M8 12l3 3 5-5" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
                letterSpacing: "0.04em",
                color: "var(--ink)",
                marginBottom: "0.25rem",
              }}
            >
              {t("guarantee_title")}
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--mid)",
              }}
            >
              {t("guarantee_desc")}
            </p>
          </div>
        </div>
      </div>

      {/* ── FAQ ACCORDION ── */}
      <div>
        <div
          className="max-w-7xl mx-auto"
          style={{ padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)" }}
        >
          <div style={{ marginBottom: "3rem" }}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "var(--red)",
                marginBottom: "0.6rem",
              }}
            >
              {t("faq_label")}
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                letterSpacing: "0.02em",
                color: "var(--ink)",
                lineHeight: 0.95,
              }}
            >
              {t("faq_title")}
            </h2>
          </div>
          <Accordion items={faqItems} />
        </div>
      </div>
    </>
  );
};
