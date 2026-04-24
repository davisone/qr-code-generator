import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BASE_URL, buildHreflang } from "@/lib/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  const url = `${BASE_URL}/${locale}/mentions-legales`;
  return {
    title: t("mentions_meta_title"),
    description: t("mentions_meta_description"),
    robots: { index: true, follow: true },
    alternates: { canonical: url, languages: buildHreflang("/mentions-legales") },
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

export default async function MentionsLegales({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <nav className="navbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-stretch h-14">
            <Link
              href="/"
              className="flex items-center px-2"
              style={{ fontFamily: "var(--font-display, cursive)", fontSize: "1.8rem", letterSpacing: "0.06em", color: "#f0ebe1", textDecoration: "none" }}
            >
              useqraft
            </Link>
            <div className="flex items-stretch">
              <Link href="/login" className="flex items-center px-5 text-xs font-bold uppercase tracking-widest border-l" style={{ color: "rgba(240,235,225,0.5)", borderColor: "rgba(255,255,255,0.08)", fontFamily: "var(--font-sans)", textDecoration: "none" }}>
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
        <h1 style={{ fontFamily: "var(--font-display, cursive)", fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "0.04em", color: "var(--ink)", lineHeight: 1, marginBottom: "0.5rem" }}>
          {t("mentions_title")}
        </h1>
        <p style={{ ...pStyle, marginBottom: "2rem", opacity: 0.6 }}>
          {t("last_updated")}
        </p>

        <div style={{ border: "var(--rule)", background: "var(--card)", padding: "0 1.5rem" }}>
          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("mentions_editor_title")}</h2>
            <p style={pStyle}>{t("mentions_editor_body")}</p>
            <ul style={{ ...pStyle, marginTop: "0.75rem", paddingLeft: "1rem", listStyle: "none" }}>
              <li><strong>{t("mentions_editor_company")}</strong></li>
              <li><strong>{t("mentions_editor_responsible")}</strong></li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("mentions_hosting_title")}</h2>
            <p style={pStyle}>{t("mentions_hosting_vercel")}</p>
            <ul style={{ ...pStyle, marginTop: "0.5rem", paddingLeft: "1rem", listStyle: "none" }}>
              <li><strong>{t("mentions_hosting_vercel_address")}</strong></li>
              <li><a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)", textDecoration: "underline" }}>vercel.com</a></li>
            </ul>
            <p style={{ ...pStyle, marginTop: "0.75rem" }}>{t("mentions_hosting_db")}</p>
            <ul style={{ ...pStyle, marginTop: "0.5rem", paddingLeft: "1rem", listStyle: "none" }}>
              <li><a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)", textDecoration: "underline" }}>supabase.com</a></li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("mentions_ip_title")}</h2>
            <p style={pStyle}>{t("mentions_ip_body")}</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("mentions_data_title")}</h2>
            <p style={pStyle}>{t("mentions_data_body")}</p>
            <p style={{ ...pStyle, marginTop: "0.5rem" }}>{t("mentions_data_rgpd")}</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("mentions_scan_title")}</h2>
            <p style={pStyle}>{t("mentions_scan_body")}</p>
            <ul style={{ ...pStyle, marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
              <li>{t("mentions_scan_item1")}</li>
              <li>{t("mentions_scan_item2")}</li>
              <li>{t("mentions_scan_item3")}</li>
              <li>{t("mentions_scan_item4")}</li>
            </ul>
            <p style={{ ...pStyle, marginTop: "0.75rem" }}>
              <strong>{t("mentions_scan_legal")}</strong>
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("mentions_liability_title")}</h2>
            <p style={pStyle}>{t("mentions_liability_body")}</p>
          </section>

          <section style={{ padding: "1.5rem 0" }}>
            <h2 style={h2Style}>{t("mentions_cookies_title")}</h2>
            <p style={pStyle}>{t("mentions_cookies_body")}</p>
          </section>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <Link href="/" style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", textDecoration: "none" }}>
            ← {t("mentions_link_home")}
          </Link>
        </div>
      </main>
    </div>
  );
}
