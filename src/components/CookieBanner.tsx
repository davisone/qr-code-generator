"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
    // Activer Google Analytics si besoin
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  };

  const refuseCookies = () => {
    localStorage.setItem("cookie-consent", "refused");
    setShowBanner(false);
    // Désactiver Google Analytics
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
        <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-[#0a0a0a] mb-1">
                Nous utilisons des cookies
              </h3>
              <p className="text-sm text-[#525252]">
                Ce site utilise des cookies pour améliorer votre expérience et analyser le trafic.
                En continuant, vous acceptez notre utilisation des cookies.{" "}
                <a
                  href="/mentions-legales"
                  className="text-[#10b981] hover:underline"
                >
                  En savoir plus
                </a>
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={refuseCookies}
                className="btn btn-outline btn-sm flex-1 sm:flex-none"
              >
                Refuser
              </button>
              <button
                onClick={acceptCookies}
                className="btn btn-primary btn-sm flex-1 sm:flex-none"
              >
                Accepter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
