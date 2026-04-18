"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { haptic } from "@/lib/haptics";
import type { ReactNode } from "react";

interface Tab {
  href: string;
  key: "dashboard" | "new" | "stats" | "profile";
  icon: ReactNode;
}

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const IconGrid = () => (
  <svg {...iconProps}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);
const IconPlus = () => (
  <svg {...iconProps}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconChart = () => (
  <svg {...iconProps}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const IconUser = () => (
  <svg {...iconProps}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const tabs: Tab[] = [
  { href: "/dashboard", key: "dashboard", icon: <IconGrid /> },
  { href: "/qrcode/new", key: "new", icon: <IconPlus /> },
  { href: "/dashboard?tab=analytics", key: "stats", icon: <IconChart /> },
  { href: "/profile", key: "profile", icon: <IconUser /> },
];

/**
 * Navigation bottom-tab mobile — visible uniquement sur mobile (sm:hidden).
 * Affichée uniquement pour les utilisateurs authentifiés.
 */
export const BottomTabs = () => {
  const { status } = useSession();
  const t = useTranslations("dashboard.bottom_tabs");
  const pathname = usePathname();

  // Masquer si non connecté
  if (status !== "authenticated") return null;

  const isActive = (href: string) => {
    const path = href.split("?")[0];
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  return (
    <nav
      aria-label="Mobile navigation"
      className="sm:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: "var(--navbar-bg)",
        borderTop: "1px solid var(--navbar-border)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <ul
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          height: 60,
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <li key={tab.key} style={{ position: "relative" }}>
              <Link
                href={tab.href}
                onClick={() => haptic.light()}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: 4,
                  color: active ? "var(--yellow)" : "rgba(240,235,225,0.55)",
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  position: "relative",
                }}
              >
                {tab.icon}
                <span>{t(tab.key)}</span>
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 28,
                      height: 2,
                      background: "var(--red)",
                    }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
