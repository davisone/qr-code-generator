import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/config";
import { Link } from "@/i18n/navigation";
import { Marquee } from "@/components/sections/Marquee";
import { Accordion } from "@/components/ui/Accordion";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  // jsonLd — données statiques, safe pour dangerouslySetInnerHTML
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
      },
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "DVS Web",
        url: BASE_URL,
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
            name: t("faq_q1"),
            acceptedAnswer: { "@type": "Answer", text: t("faq_a1") },
          },
          {
            "@type": "Question",
            name: t("faq_q2"),
            acceptedAnswer: { "@type": "Answer", text: t("faq_a2") },
          },
          {
            "@type": "Question",
            name: t("faq_q3"),
            acceptedAnswer: { "@type": "Answer", text: t("faq_a3") },
          },
          {
            "@type": "Question",
            name: t("faq_q4"),
            acceptedAnswer: { "@type": "Answer", text: t("faq_a4") },
          },
          {
            "@type": "Question",
            name: t("faq_q5"),
            acceptedAnswer: { "@type": "Answer", text: t("faq_a5") },
          },
        ],
      },
    ],
  };

  const marqueeItems = [
    "RESTAURANT",
    "ÉVÉNEMENT",
    "IMMOBILIER",
    "MUSÉE",
    "E-COMMERCE",
    "CARTE DE VISITE",
    "WIFI",
    "RÉSEAUX SOCIAUX",
  ];

  const features = [
    {
      num: "01",
      title: t("feature_analytics_title"),
      desc: t("feature_analytics_desc"),
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
          <rect x="2" y="16" width="5" height="10" fill="var(--red)" />
          <rect x="9" y="10" width="5" height="16" fill="var(--ink)" opacity="0.4" />
          <rect x="16" y="6" width="5" height="20" fill="var(--ink)" opacity="0.6" />
          <rect x="23" y="2" width="5" height="24" fill="var(--ink)" />
        </svg>
      ),
    },
    {
      num: "02",
      title: t("feature_types_title"),
      desc: t("feature_types_desc"),
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
          <rect x="2" y="2" width="10" height="10" fill="var(--ink)" />
          <rect x="16" y="2" width="10" height="10" fill="var(--red)" />
          <rect x="2" y="16" width="10" height="10" fill="var(--ink)" opacity="0.5" />
          <rect x="16" y="16" width="10" height="10" fill="var(--ink)" />
        </svg>
      ),
    },
    {
      num: "03",
      title: t("feature_export_title"),
      desc: t("feature_export_desc"),
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
          <path d="M14 4v16M14 20l-5-5M14 20l5-5" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 22h20" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      num: "04",
      title: t("feature_share_title"),
      desc: t("feature_share_desc"),
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
          <circle cx="22" cy="6" r="3" fill="var(--red)" />
          <circle cx="6" cy="14" r="3" fill="var(--ink)" />
          <circle cx="22" cy="22" r="3" fill="var(--ink)" opacity="0.5" />
          <path d="M9 12.5l10-5M9 15.5l10 5" stroke="var(--ink)" strokeWidth="1.5" />
        </svg>
      ),
    },
  ];

  const faqItems = [
    { q: t("faq_q1"), a: t("faq_a1") },
    { q: t("faq_q2"), a: t("faq_a2") },
    { q: t("faq_q3"), a: t("faq_a3") },
    { q: t("faq_q4"), a: t("faq_a4") },
    { q: t("faq_q5"), a: t("faq_a5") },
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navbar */}
      <nav className="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-stretch h-14">
            <Link
              href="/"
              className="flex items-center px-2"
              style={{
                fontFamily: "var(--font-display)",
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
                href="/pricing"
                className="flex items-center px-4 text-xs font-bold uppercase tracking-widest border-l"
                style={{
                  color: "rgba(240,235,225,0.5)",
                  borderColor: "rgba(255,255,255,0.08)",
                  fontFamily: "var(--font-sans)",
                  textDecoration: "none",
                  fontSize: "0.68rem",
                  letterSpacing: "0.12em",
                }}
              >
                {nav("pricing")}
              </Link>
              <Link
                href="/login"
                className="flex items-center px-4 text-xs font-bold uppercase tracking-widest border-l"
                style={{
                  color: "rgba(240,235,225,0.5)",
                  borderColor: "rgba(255,255,255,0.08)",
                  fontFamily: "var(--font-sans)",
                  textDecoration: "none",
                  fontSize: "0.68rem",
                  letterSpacing: "0.12em",
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
                  fontSize: "0.68rem",
                  letterSpacing: "0.12em",
                }}
              >
                {nav("start")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO SPLIT-SCREEN ── */}
      <section
        style={{
          borderBottom: "var(--rule)",
          minHeight: "calc(100vh - 56px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <style>{`
          @keyframes scan-line {
            0% { top: 8%; opacity: 0; }
            5% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 88%; opacity: 0; }
          }
          @keyframes qr-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.85; }
          }
          .qr-animated {
            animation: qr-pulse 3s ease-in-out infinite;
          }
          .scan-line {
            position: absolute;
            left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--red), transparent);
            box-shadow: 0 0 12px var(--red), 0 0 4px var(--red);
            animation: scan-line 2.8s ease-in-out infinite;
          }
          @keyframes hero-title-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hero-title-anim {
            animation: hero-title-in 0.7s ease both;
          }
          .hero-title-anim:nth-child(2) { animation-delay: 0.1s; }
          .hero-title-anim:nth-child(3) { animation-delay: 0.2s; }
          @media (max-width: 767px) {
            .hero-split { flex-direction: column !important; }
            .hero-right { border-left: none !important; border-top: var(--rule) !important; min-height: 280px !important; }
          }
        `}</style>

        <div
          className="hero-split"
          style={{
            flex: 1,
            display: "flex",
          }}
        >
          {/* Gauche 60% */}
          <div
            style={{
              flex: "0 0 60%",
              padding: "clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "2rem",
                padding: "0.3rem 0.8rem",
                border: "var(--rule-thin)",
                width: "fit-content",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--red)",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "var(--mid)",
                }}
              >
                {t("badge")}
              </span>
            </div>

            {/* Titre massif */}
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3.5rem, 9vw, 8rem)",
                  lineHeight: 0.92,
                  letterSpacing: "0.02em",
                  margin: 0,
                }}
              >
                <span className="hero-title-anim" style={{ display: "block", color: "var(--ink)" }}>
                  {t("hero_title_1")}
                </span>
                <span className="hero-title-anim" style={{ display: "block", color: "var(--red)" }}>
                  {t("hero_title_2")}
                </span>
                <span className="hero-title-anim" style={{ display: "block", color: "var(--ink)" }}>
                  {t("hero_title_3")}
                </span>
              </h1>
            </div>

            <p
              style={{
                marginTop: "2rem",
                fontSize: "1rem",
                color: "var(--mid)",
                fontFamily: "var(--font-sans)",
                maxWidth: "38ch",
                lineHeight: 1.65,
              }}
            >
              {t("hero_subtitle")}
            </p>

            <div
              className="flex items-center flex-wrap"
              style={{ gap: "0.75rem", marginTop: "2.5rem" }}
            >
              <Link href="/register" className="btn btn-red btn-lg">
                {t("cta_start")}
              </Link>
              <Link
                href="/pricing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--ink)",
                  textDecoration: "none",
                  borderBottom: "2px solid var(--ink)",
                  paddingBottom: "0.1rem",
                }}
              >
                {t("cta_pricing")}
              </Link>
            </div>
          </div>

          {/* Séparateur vertical rouge */}
          <div style={{ width: "2px", background: "var(--red)", flexShrink: 0 }} />

          {/* Droite 40% — QR animé */}
          <div
            className="hero-right"
            style={{
              flex: "0 0 40%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem 2rem",
              background: "var(--card)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Label coin */}
            <span
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--light)",
              }}
            >
              LIVE PREVIEW
            </span>

            {/* QR stylisé animé */}
            <div
              style={{
                position: "relative",
                width: "200px",
                height: "200px",
              }}
            >
              <svg
                className="qr-animated"
                viewBox="0 0 200 200"
                style={{ width: "200px", height: "200px", display: "block" }}
                aria-hidden="true"
              >
                {/* Coin haut-gauche */}
                <rect x="10" y="10" width="60" height="60" fill="none" stroke="#1a1410" strokeWidth="6" />
                <rect x="24" y="24" width="32" height="32" fill="#1a1410" />
                {/* Coin haut-droite */}
                <rect x="130" y="10" width="60" height="60" fill="none" stroke="#1a1410" strokeWidth="6" />
                <rect x="144" y="24" width="32" height="32" fill="#d4290f" />
                {/* Coin bas-gauche */}
                <rect x="10" y="130" width="60" height="60" fill="none" stroke="#1a1410" strokeWidth="6" />
                <rect x="24" y="144" width="32" height="32" fill="#1a1410" />
                {/* Modules centre */}
                <rect x="82" y="10" width="12" height="12" fill="#1a1410" />
                <rect x="98" y="10" width="12" height="12" fill="#1a1410" />
                <rect x="114" y="10" width="12" height="12" fill="#1a1410" />
                <rect x="82" y="26" width="12" height="12" fill="#1a1410" />
                <rect x="114" y="26" width="12" height="12" fill="#1a1410" />
                <rect x="10" y="82" width="12" height="12" fill="#1a1410" />
                <rect x="10" y="98" width="12" height="12" fill="#1a1410" />
                <rect x="26" y="82" width="12" height="12" fill="#1a1410" />
                <rect x="82" y="82" width="36" height="36" fill="#1a1410" />
                <rect x="130" y="82" width="12" height="12" fill="#1a1410" />
                <rect x="148" y="82" width="12" height="12" fill="#1a1410" />
                <rect x="166" y="82" width="12" height="12" fill="#1a1410" />
                <rect x="130" y="98" width="12" height="12" fill="#d4290f" />
                <rect x="166" y="98" width="12" height="12" fill="#1a1410" />
                <rect x="130" y="114" width="12" height="12" fill="#1a1410" />
                <rect x="148" y="114" width="12" height="12" fill="#1a1410" />
                <rect x="166" y="114" width="12" height="12" fill="#1a1410" />
                <rect x="82" y="130" width="12" height="12" fill="#1a1410" />
                <rect x="98" y="130" width="12" height="12" fill="#1a1410" />
                <rect x="114" y="130" width="12" height="12" fill="#1a1410" />
                <rect x="82" y="148" width="12" height="12" fill="#d4290f" />
                <rect x="114" y="148" width="12" height="12" fill="#1a1410" />
                <rect x="82" y="166" width="12" height="12" fill="#1a1410" />
                <rect x="98" y="166" width="12" height="12" fill="#1a1410" />
                <rect x="114" y="166" width="12" height="12" fill="#1a1410" />
                <rect x="130" y="166" width="12" height="12" fill="#1a1410" />
                <rect x="148" y="148" width="12" height="12" fill="#1a1410" />
                <rect x="166" y="148" width="12" height="12" fill="#1a1410" />
                <rect x="148" y="166" width="12" height="12" fill="#1a1410" />
                <rect x="166" y="166" width="12" height="12" fill="#1a1410" />
              </svg>
              {/* Ligne de scan animée */}
              <div className="scan-line" />
            </div>

            {/* Label bas */}
            <div
              style={{
                position: "absolute",
                bottom: "1.2rem",
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                letterSpacing: "0.06em",
                color: "var(--ink)",
                whiteSpace: "nowrap",
              }}
            >
              QRaft
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <Marquee items={marqueeItems} />

      {/* ── STATS ── */}
      <section style={{ borderBottom: "var(--rule)" }}>
        <div className="max-w-7xl mx-auto" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            { value: "12", label: t("stat_languages"), sub: t("stat_languages_sub") },
            { value: "50K+", label: t("stat_qr_count"), sub: t("stat_qr_count_sub") },
            { value: "0€", label: t("stat_free"), sub: t("stat_free_sub") },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                padding: "clamp(2rem, 5vw, 4rem) clamp(1.5rem, 3vw, 3rem)",
                borderRight: i < 2 ? "var(--rule)" : "none",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3rem, 8vw, 6rem)",
                  color: i === 1 ? "var(--red)" : "var(--ink)",
                  lineHeight: 1,
                  letterSpacing: "0.02em",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
                  letterSpacing: "0.06em",
                  color: "var(--ink)",
                  marginTop: "0.25rem",
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "var(--mid)",
                  marginTop: "0.4rem",
                }}
              >
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE GRID ÉDITORIAL ── */}
      <section style={{ borderBottom: "var(--rule)" }}>
        <div className="max-w-7xl mx-auto">
          {/* Header section */}
          <div
            style={{
              padding: "3rem clamp(1.5rem, 4vw, 3rem) 2rem",
              borderBottom: "var(--rule)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
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
                {t("features_label")}
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
                {t("features_title")}
              </h2>
            </div>
          </div>

          {/* Grille 2×2 asymétrique */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
            }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  padding: "clamp(2rem, 4vw, 3rem)",
                  borderRight: i % 2 === 0 ? "var(--rule)" : "none",
                  borderBottom: i < 2 ? "var(--rule)" : "none",
                  background: i === 1 ? "var(--ink)" : "var(--bg)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Numéro décoratif en fond */}
                <span
                  style={{
                    position: "absolute",
                    top: "-0.5rem",
                    right: "1rem",
                    fontFamily: "var(--font-display)",
                    fontSize: "8rem",
                    lineHeight: 1,
                    color: i === 1 ? "rgba(240,235,225,0.04)" : "rgba(26,20,16,0.05)",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {f.num}
                </span>

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ marginBottom: "1.5rem" }}>{f.icon}</div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                      letterSpacing: "0.04em",
                      color: i === 1 ? "#f0ebe1" : "var(--ink)",
                      lineHeight: 1,
                      marginBottom: "0.8rem",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.88rem",
                      color: i === 1 ? "rgba(240,235,225,0.6)" : "var(--mid)",
                      lineHeight: 1.65,
                      maxWidth: "36ch",
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section style={{ background: "var(--ink)", borderBottom: "var(--rule)" }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div
            style={{
              padding: "3rem clamp(1.5rem, 4vw, 3rem) 2rem",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "var(--yellow)",
                marginBottom: "0.6rem",
              }}
            >
              {t("how_label")}
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                letterSpacing: "0.02em",
                color: "#f0ebe1",
                lineHeight: 0.95,
              }}
            >
              {t("how_title")}
            </h2>
          </div>

          {/* 3 étapes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            }}
          >
            {[
              { num: "01", title: t("step_1_title"), desc: t("step_1_desc") },
              { num: "02", title: t("step_2_title"), desc: t("step_2_desc") },
              { num: "03", title: t("step_3_title"), desc: t("step_3_desc") },
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  padding: "clamp(2rem, 4vw, 3rem)",
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(4rem, 8vw, 6rem)",
                    color: "var(--red)",
                    lineHeight: 1,
                    marginBottom: "1.5rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  {step.num}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)",
                    letterSpacing: "0.04em",
                    color: "#f0ebe1",
                    marginBottom: "0.8rem",
                    lineHeight: 1,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    color: "rgba(240,235,225,0.55)",
                    lineHeight: 1.65,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA PRO BANDE ROUGE ── */}
      <section
        style={{
          background: "var(--red)",
          borderBottom: "var(--rule)",
          padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)",
        }}
      >
        <div className="max-w-7xl mx-auto" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                letterSpacing: "0.02em",
                color: "white",
                lineHeight: 0.95,
                marginBottom: "0.8rem",
              }}
            >
              {t("pro_cta_title")}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.5,
              }}
            >
              {t("pro_cta_subtitle")}
            </p>
          </div>
          <Link
            href="/pricing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "white",
              color: "var(--red)",
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              fontSize: "0.78rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "1rem 2.5rem",
              textDecoration: "none",
              flexShrink: 0,
              border: "2px solid white",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {t("pro_cta")} →
          </Link>
        </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section style={{ borderBottom: "var(--rule)" }}>
        <div className="max-w-7xl mx-auto" style={{ padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)" }}>
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
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ borderBottom: "var(--rule)" }}>
        <div
          className="max-w-7xl mx-auto"
          style={{
            padding: "clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 3rem)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "var(--mid)",
              marginBottom: "1rem",
            }}
          >
            {t("cta_final_label")}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 8vw, 6.5rem)",
              letterSpacing: "0.02em",
              color: "var(--ink)",
              lineHeight: 0.92,
              marginBottom: "2.5rem",
              maxWidth: "14ch",
            }}
          >
            {t("cta_title_1")} <span style={{ color: "var(--red)" }}>{t("cta_title_2")}</span>
          </h2>
          <Link href="/register" className="btn btn-red btn-lg">
            {t("cta_button")}
          </Link>
        </div>
      </section>
    </div>
  );
}
