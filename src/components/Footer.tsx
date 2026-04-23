"use client";

import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  fr: "FR", en: "EN", es: "ES", de: "DE", it: "IT",
  pt: "PT", nl: "NL", "pt-BR": "PT-BR", "es-MX": "ES-MX",
  ja: "JA", zh: "ZH", ko: "KO",
};

const Footer = () => {
  const t = useTranslations("footer");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleLocaleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.replace(pathname, { locale: e.target.value });
  }

  const linkStyle: React.CSSProperties = {
    color: "rgba(240,235,225,0.45)",
    textDecoration: "none",
    fontSize: "0.68rem",
    fontFamily: "var(--font-sans)",
    lineHeight: 2,
  };
  const colTitleStyle: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontSize: "0.75rem",
    letterSpacing: "0.08em",
    color: "rgba(240,235,225,0.7)",
    marginBottom: "0.5rem",
    textTransform: "uppercase",
  };

  return (
    <footer className="footer">
      {/* Colonnes de liens */}
      <div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: "2.5rem", paddingBottom: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1.5rem" }}
      >
        {/* Produit */}
        <div>
          <p style={colTitleStyle}>Product</p>
          <Link href="/qr-code-generator/text" style={linkStyle}>Generator</Link><br />
          <Link href="/qr-templates" style={linkStyle}>Templates</Link><br />
          <Link href="/pricing" style={linkStyle}>Pricing</Link><br />
          <Link href="/blog" style={linkStyle}>Blog</Link>
        </div>

        {/* Ressources */}
        <div>
          <p style={colTitleStyle}>Resources</p>
          <Link href="/guides" style={linkStyle}>Guides</Link><br />
          <Link href="/glossary" style={linkStyle}>Glossary</Link><br />
          <Link href="/use-cases" style={linkStyle}>Use Cases</Link><br />
          <Link href="/compare" style={linkStyle}>Comparisons</Link>
        </div>

        {/* Comparaisons top */}
        <div>
          <p style={colTitleStyle}>Compare</p>
          <Link href="/compare/useqraft-vs-qr-code-generator" style={linkStyle}>vs QR Code Generator</Link><br />
          <Link href="/compare/useqraft-vs-qr-monkey" style={linkStyle}>vs QR Monkey</Link><br />
          <Link href="/compare/useqraft-vs-qr-tiger" style={linkStyle}>vs QR Tiger</Link><br />
          <Link href="/compare/useqraft-vs-flowcode" style={linkStyle}>vs Flowcode</Link>
        </div>

        {/* Use cases top */}
        <div>
          <p style={colTitleStyle}>Use Cases</p>
          <Link href="/use-cases/restaurant" style={linkStyle}>Restaurant</Link><br />
          <Link href="/use-cases/retail" style={linkStyle}>Retail</Link><br />
          <Link href="/use-cases/event" style={linkStyle}>Event</Link><br />
          <Link href="/use-cases/hotel" style={linkStyle}>Hotel</Link>
        </div>

        {/* Légal */}
        <div>
          <p style={colTitleStyle}>Legal</p>
          <Link href="/mentions-legales" style={linkStyle}>{t("legal")}</Link><br />
          <Link href="/cgu" style={linkStyle}>CGU</Link><br />
          <Link href="/politique-confidentialite" style={linkStyle}>{t("privacy")}</Link><br />
          <a
            href="https://g.page/r/CcSyetXUJJrpEAE/review"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            {t("google_review")}
          </a>
        </div>
      </div>

      {/* Barre bottom */}
      <div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem", paddingBottom: "1rem", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}
      >
        <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-sans)", color: "rgba(240,235,225,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          &copy; {new Date().getFullYear()} useqraft — {t("powered_by")}{" "}
          <a
            href="https://dvs-web.fr"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "rgba(240,235,225,0.7)", textDecoration: "underline" }}
          >
            DVS-Web
          </a>
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <select
            value={locale}
            onChange={handleLocaleChange}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(240,235,225,0.55)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "0.2rem 0.4rem",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {routing.locales.map((l) => (
              <option key={l} value={l} style={{ background: "#1a1410", color: "#f0ebe1" }}>
                {LOCALE_LABELS[l]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
