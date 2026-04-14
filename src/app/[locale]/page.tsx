import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/config";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  // jsonLd is static structured data (not user-supplied) — safe for dangerouslySetInnerHTML
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${BASE_URL}/#app`,
        name: "QRaft",
        url: BASE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript",
        softwareVersion: "1.0",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        },
        screenshot: `${BASE_URL}/QRaft.png`,
      },
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "DVS Web",
        url: BASE_URL,
        logo: `${BASE_URL}/QRaft.png`,
        founder: { "@type": "Person", name: "Evan Davison" },
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "QRaft",
        publisher: { "@id": `${BASE_URL}/#organization` },
        inLanguage: locale,
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: t("faq_1_q"),
            acceptedAnswer: { "@type": "Answer", text: t("faq_1_a") },
          },
          {
            "@type": "Question",
            name: t("faq_2_q"),
            acceptedAnswer: { "@type": "Answer", text: t("faq_2_a") },
          },
          {
            "@type": "Question",
            name: t("faq_3_q"),
            acceptedAnswer: { "@type": "Answer", text: t("faq_3_a") },
          },
          {
            "@type": "Question",
            name: t("faq_4_q"),
            acceptedAnswer: { "@type": "Answer", text: t("faq_4_a") },
          },
        ],
      },
    ],
  };

  const features = [
    { title: t("feature_colors_title"), desc: t("feature_colors_desc"), icon: "●" },
    { title: t("feature_logo_title"), desc: t("feature_logo_desc"), icon: "◈" },
    { title: t("feature_export_title"), desc: t("feature_export_desc"), icon: "↓" },
    { title: t("feature_share_title"), desc: t("feature_share_desc"), icon: "↗" },
    { title: t("feature_stats_title"), desc: t("feature_stats_desc"), icon: "◎" },
    { title: t("feature_zip_title"), desc: t("feature_zip_desc"), icon: "⊞" },
  ];

  const steps = [
    { num: t("step1_num"), title: t("step1_title"), desc: t("step1_desc") },
    { num: t("step2_num"), title: t("step2_title"), desc: t("step2_desc") },
    { num: t("step3_num"), title: t("step3_title"), desc: t("step3_desc") },
  ];

  const faqs = [
    { q: t("faq_1_q"), a: t("faq_1_a") },
    { q: t("faq_2_q"), a: t("faq_2_a") },
    { q: t("faq_3_q"), a: t("faq_3_a") },
    { q: t("faq_4_q"), a: t("faq_4_a") },
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navbar */}
      <nav className="navbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-stretch h-14">
            <Link
              href="/"
              className="flex items-center px-2"
              style={{
                fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
                fontSize: "1.8rem",
                letterSpacing: "0.06em",
                color: "#f0ebe1",
                textDecoration: "none",
              }}
            >
              QRaft
            </Link>
            <div className="flex items-stretch">
              <Link
                href="/login"
                className="flex items-center px-5 text-xs font-bold uppercase tracking-widest border-l"
                style={{
                  color: "rgba(240,235,225,0.5)",
                  borderColor: "rgba(255,255,255,0.08)",
                  fontFamily: "var(--font-sans)",
                  textDecoration: "none",
                }}
              >
                {nav("login")}
              </Link>
              <Link
                href="/register"
                className="flex items-center px-5 text-xs font-bold uppercase tracking-widest"
                style={{
                  background: "var(--red)",
                  color: "white",
                  fontFamily: "var(--font-sans)",
                  textDecoration: "none",
                }}
              >
                {nav("start")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ borderBottom: "var(--rule)" }}>
        <div style={{ background: "var(--red)", padding: "0.45rem 0" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.62rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "rgba(255,255,255,0.85)",
            }}>
              {t("badge")}
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 style={{
                fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
                fontSize: "clamp(4rem, 10vw, 7rem)",
                lineHeight: 0.95,
                letterSpacing: "0.03em",
                color: "var(--ink)",
              }}>
                {t("hero_title_1")}<br />
                <span style={{ color: "var(--red)" }}>{t("hero_title_2")}</span><br />
                {t("hero_title_3")}<br />{t("hero_title_4")}
              </h1>
              <p style={{
                marginTop: "1.5rem",
                fontSize: "1rem",
                color: "var(--mid)",
                fontFamily: "var(--font-sans)",
                maxWidth: "34ch",
                lineHeight: 1.6,
              }}>
                {t("hero_desc")}
              </p>
              <div className="flex items-center gap-3 mt-8 flex-wrap">
                <Link href="/register" className="btn btn-primary btn-lg">
                  {t("cta_primary")}
                </Link>
                <Link href="/login" className="btn btn-ghost btn-lg">
                  {t("cta_login")}
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <div style={{
                border: "var(--rule)",
                background: "var(--card)",
                padding: "2rem",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute",
                  top: "0.8rem",
                  left: "0.8rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--light)",
                }}>
                  {t("preview_label")}
                </div>
                <div style={{ background: "white", padding: "1.5rem", border: "var(--rule-thin)", marginTop: "0.5rem" }}>
                  <svg viewBox="0 0 100 100" style={{ width: "140px", height: "140px", display: "block" }} aria-hidden="true">
                    <rect fill="#1a1410" x="10" y="10" width="20" height="20"/>
                    <rect fill="#1a1410" x="70" y="10" width="20" height="20"/>
                    <rect fill="#1a1410" x="10" y="70" width="20" height="20"/>
                    <rect fill="#1a1410" x="40" y="10" width="8" height="8"/>
                    <rect fill="#1a1410" x="52" y="10" width="8" height="8"/>
                    <rect fill="#1a1410" x="40" y="22" width="8" height="8"/>
                    <rect fill="#1a1410" x="10" y="40" width="8" height="8"/>
                    <rect fill="#1a1410" x="22" y="40" width="8" height="8"/>
                    <rect fill="#1a1410" x="10" y="52" width="8" height="8"/>
                    <rect fill="#1a1410" x="40" y="40" width="20" height="20"/>
                    <rect fill="#1a1410" x="70" y="40" width="8" height="8"/>
                    <rect fill="#1a1410" x="82" y="40" width="8" height="8"/>
                    <rect fill="#1a1410" x="70" y="52" width="8" height="8"/>
                    <rect fill="#1a1410" x="40" y="70" width="8" height="8"/>
                    <rect fill="#1a1410" x="52" y="70" width="8" height="8"/>
                    <rect fill="#1a1410" x="40" y="82" width="8" height="8"/>
                    <rect fill="#1a1410" x="70" y="70" width="8" height="8"/>
                    <rect fill="#1a1410" x="82" y="70" width="8" height="8"/>
                    <rect fill="#1a1410" x="70" y="82" width="8" height="8"/>
                    <rect fill="#1a1410" x="82" y="82" width="8" height="8"/>
                  </svg>
                </div>
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                  <span style={{
                    fontFamily: "var(--font-display, cursive)",
                    fontSize: "1.4rem",
                    letterSpacing: "0.06em",
                    color: "var(--ink)",
                  }}>QRaft</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ background: "var(--ink)", borderBottom: "var(--rule)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3">
            {[
              { value: "∞", label: t("stat_unlimited") },
              { value: "3", label: t("stat_formats") },
              { value: "100%", label: t("stat_free") },
            ].map((stat, i) => (
              <div key={i} style={{
                padding: "1.2rem 2rem",
                textAlign: "center",
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}>
                <div style={{
                  fontFamily: "var(--font-display, cursive)",
                  fontSize: "2.4rem",
                  color: "var(--yellow)",
                  lineHeight: 1,
                  letterSpacing: "0.04em",
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(240,235,225,0.45)",
                  marginTop: "0.3rem",
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div style={{ marginBottom: "2rem" }}>
          <div style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.62rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--red)",
            marginBottom: "0.5rem",
          }}>{t("features_label")}</div>
          <h2 style={{
            fontFamily: "var(--font-display, cursive)",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            letterSpacing: "0.04em",
            color: "var(--ink)",
            lineHeight: 1,
          }}>{t("features_title")}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ border: "var(--rule)" }}>
          {features.map((f, i) => (
            <div key={i} style={{
              padding: "1.5rem",
              background: "var(--card)",
              borderRight: (i + 1) % 3 === 0 ? "none" : "var(--rule)",
              borderBottom: i < 3 ? "var(--rule)" : "none",
            }}>
              <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "1.4rem", color: "var(--red)", marginBottom: "0.8rem" }}>{f.icon}</div>
              <h3 style={{ fontFamily: "var(--font-display, cursive)", fontSize: "1.2rem", letterSpacing: "0.04em", color: "var(--ink)", marginBottom: "0.5rem" }}>{f.title}</h3>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--mid)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ borderTop: "var(--rule)", borderBottom: "var(--rule)", background: "var(--ink)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--yellow)", marginBottom: "0.5rem" }}>{t("how_label")}</div>
            <h2 style={{ fontFamily: "var(--font-display, cursive)", fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "0.04em", color: "#f0ebe1", lineHeight: 1 }}>{t("how_title")}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            {steps.map((step, i) => (
              <div key={i} style={{ padding: "2rem", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                <div style={{ fontFamily: "var(--font-display, cursive)", fontSize: "3.5rem", color: "var(--red)", lineHeight: 1, marginBottom: "1rem" }}>{step.num}</div>
                <h3 style={{ fontFamily: "var(--font-display, cursive)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#f0ebe1", marginBottom: "0.6rem" }}>{step.title}</h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "rgba(240,235,225,0.55)", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--red)", marginBottom: "0.5rem" }}>{t("faq_label")}</div>
          <h2 style={{ fontFamily: "var(--font-display, cursive)", fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "0.04em", color: "var(--ink)", lineHeight: 1 }}>{t("faq_title")}</h2>
        </div>

        <div style={{ border: "var(--rule)" }}>
          {faqs.map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2" style={{ borderBottom: i < 3 ? "var(--rule)" : "none" }}>
              <div style={{ padding: "1.5rem", borderRight: "var(--rule)", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", fontWeight: 700, color: "var(--red)", marginTop: "0.15rem", flexShrink: 0 }}>0{i + 1}</span>
                <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 700, color: "var(--ink)", lineHeight: 1.4 }}>{item.q}</h3>
              </div>
              <div style={{ padding: "1.5rem" }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--mid)", lineHeight: 1.6 }}>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section style={{ background: "var(--red)", borderTop: "var(--rule)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 style={{
            fontFamily: "var(--font-display, cursive)",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            letterSpacing: "0.04em",
            color: "white",
            lineHeight: 1,
            marginBottom: "1.5rem",
          }}>
            {t("cta_title_1")}<br />{t("cta_title_2")}
          </h2>
          <Link
            href="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "white",
              color: "var(--red)",
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "0.85rem 2rem",
              textDecoration: "none",
            }}
          >
            {t("cta_button")}
          </Link>
        </div>
      </section>
    </div>
  );
}
