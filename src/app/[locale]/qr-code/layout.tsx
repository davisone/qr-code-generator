import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

interface Props {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function QRCodeProgrammaticLayout({ children, params }: Props) {
  const { locale } = await params;
  const nav = await getTranslations({ locale, namespace: "nav" });

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <nav className="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-stretch h-14">
            <Link
              href="/"
              className="flex items-center px-2"
              style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", letterSpacing: "0.06em", color: "#f0ebe1", textDecoration: "none" }}
            >
              useqraft
            </Link>
            <div className="flex items-stretch">
              <Link
                href="/pricing"
                className="hidden sm:flex items-center px-4 text-xs font-bold uppercase tracking-widest border-l"
                style={{ color: "rgba(240,235,225,0.5)", borderColor: "rgba(255,255,255,0.08)", fontFamily: "var(--font-sans)", textDecoration: "none", fontSize: "0.68rem", letterSpacing: "0.12em" }}
              >
                {nav("pricing")}
              </Link>
              <Link
                href="/register"
                className="flex items-center px-5 text-xs font-bold uppercase tracking-widest"
                style={{ background: "var(--red)", color: "white", fontFamily: "var(--font-sans)", textDecoration: "none", fontSize: "0.68rem", letterSpacing: "0.12em" }}
              >
                {nav("start")}
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
