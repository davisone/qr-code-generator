"use client";

import { signOut, useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Navbar() {
  const { data: session } = useSession();
  const t = useTranslations("nav");

  return (
    <nav className="navbar">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-stretch h-14">
          <Link
            href="/dashboard"
            className="flex items-center px-2 transition-colors"
            style={{
              fontFamily: "var(--font-display, 'Bebas Neue'), cursive",
              fontSize: "1.8rem",
              letterSpacing: "0.06em",
              color: "#f0ebe1",
              textDecoration: "none",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--yellow)")}
            onMouseLeave={e => (e.currentTarget.style.color = "#f0ebe1")}
          >
            QRaft
          </Link>

          <div className="flex items-stretch">
            <span
              className="hidden sm:flex items-center px-4 text-xs uppercase tracking-widest font-bold border-l"
              style={{
                color: "rgba(240,235,225,0.45)",
                borderColor: "rgba(255,255,255,0.08)",
                fontFamily: "var(--font-sans, sans-serif)",
              }}
            >
              {session?.user?.name || session?.user?.email}
            </span>
            <Link
              href="/profile"
              className="hidden sm:flex items-center px-4 text-xs uppercase tracking-widest font-bold border-l transition-colors"
              style={{
                color: "rgba(240,235,225,0.45)",
                borderColor: "rgba(255,255,255,0.08)",
                fontFamily: "var(--font-sans, sans-serif)",
                textDecoration: "none",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f0ebe1")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,235,225,0.45)")}
            >
              {t("profile")}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center px-5 text-xs font-bold uppercase tracking-widest border-l transition-colors"
              style={{
                color: "rgba(240,235,225,0.45)",
                borderColor: "rgba(255,255,255,0.08)",
                fontFamily: "var(--font-sans, sans-serif)",
                background: "none",
                border: "none",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f0ebe1")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,235,225,0.45)")}
            >
              {t("logout")}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
