import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BASE_URL, buildHreflang } from "@/lib/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  const url = `${BASE_URL}/${locale}/politique-confidentialite`;
  return {
    title: t("privacy_meta_title"),
    description: t("privacy_meta_description"),
    robots: { index: true, follow: true },
    alternates: { canonical: url, languages: buildHreflang("/politique-confidentialite") },
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

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontFamily: "var(--font-sans)",
  fontSize: "0.82rem",
  color: "var(--mid)",
  marginTop: "0.75rem",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.5rem 0.75rem",
  background: "rgba(0,0,0,0.04)",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  fontSize: "0.7rem",
  borderBottom: "1px solid rgba(0,0,0,0.08)",
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid rgba(0,0,0,0.05)",
  verticalAlign: "top",
};

export default async function PolitiqueConfidentialite({ params }: Props) {
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
          {t("privacy_title")}
        </h1>
        <p style={{ ...pStyle, marginBottom: "2rem", opacity: 0.6 }}>
          {t("privacy_full_title")} — {t("last_updated")}
        </p>

        <div style={{ border: "var(--rule)", background: "var(--card)", padding: "0 1.5rem" }}>
          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("privacy_1_title")}</h2>
            <p style={pStyle}>
              <strong>{t("privacy_1_body")}</strong><br />
              {t("privacy_1_contact")}
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("privacy_2_title")}</h2>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>{t("privacy_2_col_data")}</th>
                  <th style={thStyle}>{t("privacy_2_col_purpose")}</th>
                  <th style={thStyle}>{t("privacy_2_col_basis")}</th>
                  <th style={thStyle}>{t("privacy_2_col_duration")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>{t("privacy_2_row1_data")}</td>
                  <td style={tdStyle}>{t("privacy_2_row1_purpose")}</td>
                  <td style={tdStyle}>{t("privacy_2_row1_basis")}</td>
                  <td style={tdStyle}>{t("privacy_2_row1_duration")}</td>
                </tr>
                <tr>
                  <td style={tdStyle}>{t("privacy_2_row2_data")}</td>
                  <td style={tdStyle}>{t("privacy_2_row2_purpose")}</td>
                  <td style={tdStyle}>{t("privacy_2_row2_basis")}</td>
                  <td style={tdStyle}>{t("privacy_2_row2_duration")}</td>
                </tr>
                <tr>
                  <td style={tdStyle}>{t("privacy_2_row3_data")}</td>
                  <td style={tdStyle}>{t("privacy_2_row3_purpose")}</td>
                  <td style={tdStyle}>{t("privacy_2_row3_basis")}</td>
                  <td style={tdStyle}>{t("privacy_2_row3_duration")}</td>
                </tr>
                <tr>
                  <td style={tdStyle}>{t("privacy_2_row4_data")}</td>
                  <td style={tdStyle}>{t("privacy_2_row4_purpose")}</td>
                  <td style={tdStyle}>{t("privacy_2_row4_basis")}</td>
                  <td style={tdStyle}>{t("privacy_2_row4_duration")}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("privacy_3_title")}</h2>
            <p style={pStyle}>{t("privacy_3_body")}</p>
            <p style={{ ...pStyle, marginTop: "0.75rem" }}>
              {t("privacy_3_optout")}
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("privacy_4_title")}</h2>
            <ul style={{ ...pStyle, paddingLeft: "1.25rem", marginTop: "0.25rem" }}>
              <li><strong>{t("privacy_4_vercel")}</strong></li>
              <li><strong>{t("privacy_4_supabase")}</strong></li>
              <li><strong>{t("privacy_4_google")}</strong></li>
              <li><strong>{t("privacy_4_github")}</strong></li>
              <li><strong>{t("privacy_4_stripe")}</strong></li>
              <li><strong>{t("privacy_4_sentry")}</strong></li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("privacy_5_title")}</h2>
            <p style={pStyle}>{t("privacy_5_body")}</p>
            <ul style={{ ...pStyle, paddingLeft: "1.25rem", marginTop: "0.5rem" }}>
              <li><strong>{t("privacy_5_access")}</strong></li>
              <li><strong>{t("privacy_5_rectify")}</strong></li>
              <li><strong>{t("privacy_5_delete")}</strong></li>
              <li><strong>{t("privacy_5_portability")}</strong></li>
              <li><strong>{t("privacy_5_opposition")}</strong></li>
            </ul>
            <p style={{ ...pStyle, marginTop: "0.75rem" }}>{t("privacy_5_contact")}</p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>{t("privacy_6_title")}</h2>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>{t("privacy_6_col_cookie")}</th>
                  <th style={thStyle}>{t("privacy_6_col_type")}</th>
                  <th style={thStyle}>{t("privacy_6_col_purpose")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}><code>{t("privacy_6_row1_cookie")}</code></td>
                  <td style={tdStyle}>{t("privacy_6_row1_type")}</td>
                  <td style={tdStyle}>{t("privacy_6_row1_purpose")}</td>
                </tr>
                <tr>
                  <td style={tdStyle}><code>{t("privacy_6_row2_cookie")}</code></td>
                  <td style={tdStyle}>{t("privacy_6_row2_type")}</td>
                  <td style={tdStyle}>{t("privacy_6_row2_purpose")}</td>
                </tr>
                <tr>
                  <td style={tdStyle}><code>{t("privacy_6_row3_cookie")}</code></td>
                  <td style={tdStyle}>{t("privacy_6_row3_type")}</td>
                  <td style={tdStyle}>{t("privacy_6_row3_purpose")}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={{ padding: "1.5rem 0" }}>
            <h2 style={h2Style}>{t("privacy_7_title")}</h2>
            <p style={pStyle}>{t("privacy_7_body")}</p>
          </section>
        </div>

        <div style={{ marginTop: "2rem", display: "flex", gap: "2rem" }}>
          <Link href="/" style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", textDecoration: "none" }}>
            ← {t("back_home")}
          </Link>
          <Link href="/cgu" style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", textDecoration: "none" }}>
            {t("privacy_link_cgu")} →
          </Link>
        </div>
      </main>
    </div>
  );
}
