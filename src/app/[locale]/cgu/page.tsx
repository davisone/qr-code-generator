import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BASE_URL, buildHreflang } from "@/lib/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  const url = `${BASE_URL}/${locale}/cgu`;
  return {
    title: t("cgu_meta_title"),
    description: t("cgu_meta_description"),
    robots: { index: true, follow: true },
    alternates: { canonical: url, languages: buildHreflang("/cgu") },
  };
}

const sectionStyle: React.CSSProperties = {
  borderBottom: "var(--rule)",
  padding: "1.5rem 0",
};

const h2Style: React.CSSProperties = {
  fontFamily: "var(--font-display, cursive)",
  fontSize: "1.3rem",
  letterSpacing: "0.04em",
  color: "var(--ink)",
  marginBottom: "0.75rem",
};

const pStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.85rem",
  color: "var(--mid)",
  lineHeight: 1.7,
};

export default async function CGU({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <nav className="navbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-stretch h-14">
            <Link
              href="/"
              style={{ fontFamily: "var(--font-display, cursive)", fontSize: "1.8rem", letterSpacing: "0.06em", color: "#f0ebe1", textDecoration: "none", display: "flex", alignItems: "center", padding: "0 0.5rem" }}
            >
              useqraft
            </Link>
            <div className="flex items-stretch">
              <Link href="/login" style={{ display: "flex", alignItems: "center", padding: "0 1.25rem", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", borderLeft: "1px solid rgba(255,255,255,0.08)", color: "rgba(240,235,225,0.5)", fontFamily: "var(--font-sans)", textDecoration: "none" }}>
                {t("nav_login")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ background: "var(--red)", padding: "0.45rem 0" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.85)" }}>
            {t("banner_label")}
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 style={{ fontFamily: "var(--font-display, cursive)", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.04em", color: "var(--ink)", lineHeight: 1, marginBottom: "0.5rem" }}>
          {t("cgu_title")}
        </h1>
        <p style={{ ...pStyle, marginBottom: "2rem", opacity: 0.6 }}>
          {t("cgu_full_title")} — {t("last_updated")}
        </p>

        <div style={{ border: "var(--rule)", background: "var(--card)", padding: "0 1.5rem" }}>
          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("cgu_1_title")}</h2>
            <p style={pStyle}>{t("cgu_1_body")}</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("cgu_2_title")}</h2>
            <p style={pStyle}>{t("cgu_2_body")}</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("cgu_3_title")}</h2>
            <p style={pStyle}>{t("cgu_3_body")}</p>
            <ul style={{ ...pStyle, paddingLeft: "1.25rem", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
              <li><strong>{t("cgu_3_free")}</strong></li>
              <li><strong>{t("cgu_3_pro")}</strong></li>
            </ul>
            <p style={pStyle}>{t("cgu_3_stripe")}</p>
            <p style={{ ...pStyle, marginTop: "0.5rem" }}>{t("cgu_3_cancel")}</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("cgu_4_title")}</h2>
            <p style={pStyle}>{t("cgu_4_body")}</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("cgu_5_title")}</h2>
            <p style={pStyle}>{t("cgu_5_body")}</p>
            <ul style={{ ...pStyle, paddingLeft: "1.25rem", marginTop: "0.5rem" }}>
              <li>{t("cgu_5_item1")}</li>
              <li>{t("cgu_5_item2")}</li>
              <li>{t("cgu_5_item3")}</li>
              <li>{t("cgu_5_item4")}</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("cgu_6_title")}</h2>
            <p style={pStyle}>{t("cgu_6_body")}</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("cgu_7_title")}</h2>
            <p style={pStyle}>{t("cgu_7_body")}</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("cgu_8_title")}</h2>
            <p style={pStyle}>{t("cgu_8_body")}</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("cgu_9_title")}</h2>
            <p style={pStyle}>{t("cgu_9_body")}</p>
          </section>

          <section style={{ padding: "1.5rem 0" }}>
            <h2 style={h2Style}>{t("cgu_10_title")}</h2>
            <p style={pStyle}>{t("cgu_10_body")}</p>
          </section>
        </div>

        <div style={{ marginTop: "2rem", display: "flex", gap: "2rem" }}>
          <Link href="/" style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", textDecoration: "none" }}>
            ← {t("back_home")}
          </Link>
          <Link href="/politique-confidentialite" style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", textDecoration: "none" }}>
            {t("cgu_link_privacy")} →
          </Link>
        </div>
      </main>
    </div>
  );
}
