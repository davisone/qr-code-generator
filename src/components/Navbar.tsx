"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";


export default function Navbar() {
  const { data: session } = useSession();
  const t = useTranslations("nav");

  const sessionKey = session?.user?.email ?? null;
  const [isProRaw, setIsProRaw] = useState(false);
  const isPro = sessionKey ? isProRaw : false;

  useEffect(() => {
    if (!sessionKey) return;
    const controller = new AbortController();
    fetch("/api/user/subscription", { signal: controller.signal })
      .then((r) => r.json())
      .then((d: { isPro?: boolean }) => setIsProRaw(d.isPro ?? false))
      .catch(() => {
        // silently ignore (aborts, network errors)
      });
    return () => controller.abort();
  }, [sessionKey]);

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
            {session && (
              <Link
                href="/templates"
                className="hidden sm:flex items-center px-4 text-xs uppercase tracking-widest font-bold border-l transition-colors"
                style={{
                  color: "rgba(240,235,225,0.45)",
                  borderColor: "rgba(255,255,255,0.08)",
                  fontFamily: "var(--font-sans)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ebe1")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,225,0.45)")}
              >
                {t("templates")}
              </Link>
            )}
            {session && (
              <Link
                href="/bulk"
                className="hidden sm:flex items-center px-4 text-xs uppercase tracking-widest font-bold border-l transition-colors"
                style={{
                  color: "rgba(240,235,225,0.45)",
                  borderColor: "rgba(255,255,255,0.08)",
                  fontFamily: "var(--font-sans)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ebe1")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,225,0.45)")}
              >
                {t("bulk")}
              </Link>
            )}
            <Link
              href="/blog"
              className="hidden sm:flex items-center px-4 text-xs uppercase tracking-widest font-bold border-l transition-colors"
              style={{
                color: "rgba(240,235,225,0.45)",
                borderColor: "rgba(255,255,255,0.08)",
                fontFamily: "var(--font-sans)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ebe1")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,225,0.45)")}
            >
              Blog
            </Link>
            <Link
              href="/pricing"
              className="flex items-center px-4 text-xs uppercase tracking-widest font-bold border-l transition-colors"
              style={{
                color: "rgba(240,235,225,0.45)",
                borderColor: "rgba(255,255,255,0.08)",
                fontFamily: "var(--font-sans)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f0ebe1")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,225,0.45)")}
            >
              {t("pricing")}
            </Link>
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
            {isPro && (
              <span
                className="hidden sm:flex items-center px-3 text-xs font-bold uppercase tracking-widest border-l"
                style={{
                  color: "var(--red)",
                  borderColor: "rgba(255,255,255,0.08)",
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.12em",
                }}
              >
                PRO
              </span>
            )}
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
