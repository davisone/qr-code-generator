import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

interface Props {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function QRCodeGeneratorLayout({ children, params }: Props) {
  const { locale } = await params;
  const nav = await getTranslations({ locale, namespace: "nav" });
  const t = await getTranslations({ locale, namespace: "seo_generator" });

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Dark Navbar — same structure as home */}
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
                className="hidden sm:flex items-center px-4 text-xs font-bold uppercase tracking-widest border-l"
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
                className="hidden sm:flex items-center px-4 text-xs font-bold uppercase tracking-widest border-l"
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

      {/* Breadcrumb strip */}
      <div
        style={{
          borderBottom: "var(--rule)",
          background: "var(--card)",
        }}
      >
        <div
          className="max-w-7xl mx-auto"
          style={{
            padding: "0.7rem clamp(1rem, 3vw, 2rem)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--mid)",
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          <Link
            href="/"
            style={{ color: "var(--mid)", textDecoration: "none" }}
          >
            {t("breadcrumb_home")}
          </Link>
          <span aria-hidden>/</span>
          <span style={{ color: "var(--ink)", fontWeight: 700 }}>
            {t("breadcrumb_generators")}
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}
