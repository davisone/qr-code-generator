"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const t = useTranslations("legal");

  useEffect(() => {
    const consent = window.localStorage.getItem("cookie-consent");
    if (consent) return;

    const rafId = window.requestAnimationFrame(() => {
      setShowBanner(true);
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  };

  const refuseCookies = () => {
    localStorage.setItem("cookie-consent", "refused");
    setShowBanner(false);
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
      });
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div style={{ background: "var(--card)", border: "var(--rule)", color: "var(--ink)" }} className="rounded-2xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>
                {t("cookie_title")}
              </h3>
              <p className="text-sm" style={{ color: "var(--mid)" }}>
                {t("cookie_description")}{" "}
                <Link
                  href="/mentions-legales"
                  style={{ color: "var(--red)" }}
                  className="hover:underline"
                >
                  {t("cookie_learn_more")}
                </Link>
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={refuseCookies}
                className="btn btn-outline btn-sm flex-1 sm:flex-none"
              >
                {t("cookie_refuse")}
              </button>
              <button
                onClick={acceptCookies}
                className="btn btn-primary btn-sm flex-1 sm:flex-none"
              >
                {t("cookie_accept")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
