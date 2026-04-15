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

  return (
    <footer className="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-sans)", color: "rgba(240,235,225,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          &copy; {new Date().getFullYear()} QRaft — {t("powered_by")}{" "}
          <a
            href="https://dvs-web.fr"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "rgba(240,235,225,0.7)", textDecoration: "underline" }}
          >
            DVS-Web
          </a>
        </span>
        <div className="flex items-center gap-5" style={{ fontSize: "0.68rem", fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {/* Sélecteur de langue */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ color: "rgba(240,235,225,0.3)", fontSize: "0.6rem" }}>⊞</span>
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

          <a
            href="https://g.page/r/CcSyetXUJJrpEAE/review"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 transition-colors"
            style={{ color: "rgba(240,235,225,0.45)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#f0ebe1")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,235,225,0.45)")}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {t("google_review")}
          </a>
          <Link
            href="/mentions-legales"
            style={{ color: "rgba(240,235,225,0.45)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#f0ebe1")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,235,225,0.45)")}
          >
            {t("legal")}
          </Link>
          <Link
            href="/cgu"
            style={{ color: "rgba(240,235,225,0.45)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#f0ebe1")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,235,225,0.45)")}
          >
            CGU
          </Link>
          <Link
            href="/politique-confidentialite"
            style={{ color: "rgba(240,235,225,0.45)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#f0ebe1")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,235,225,0.45)")}
          >
            {t("privacy")}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
