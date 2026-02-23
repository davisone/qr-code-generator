import Link from "next/link";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#525252]">
        <span>
          &copy; {new Date().getFullYear()} QRaft — Propulsé par{" "}
          <a
            href="https://dvs-web.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#0a0a0a] underline"
          >
            DVS-Web
          </a>
          . Tous droits réservés.
        </span>
        <div className="flex items-center gap-4">
          <a
            href="https://g.page/r/CcSyetXUJJrpEAE/review"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#0a0a0a] transition flex items-center gap-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Avis Google
          </a>
          <Link href="/mentions-legales" className="hover:text-[#0a0a0a] transition">
            Mentions légales
          </Link>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
