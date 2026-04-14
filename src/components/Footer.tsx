"use client";

import Link from "next/link";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-sans)", color: "rgba(240,235,225,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          &copy; {new Date().getFullYear()} QRaft — Propulsé par{" "}
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
            Avis Google
          </a>
          <Link
            href="/mentions-legales"
            style={{ color: "rgba(240,235,225,0.45)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#f0ebe1")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,235,225,0.45)")}
          >
            Mentions légales
          </Link>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
