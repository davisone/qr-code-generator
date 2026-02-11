import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site QRaft, édité par DVS Web (Evan Davison). Informations sur l'éditeur, la propriété intellectuelle et la protection des données.",
};

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navbar */}
      <nav className="navbar sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            QRaft
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[#525252] hover:text-[#0a0a0a] transition"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="btn btn-primary btn-sm"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-[#0a0a0a] mb-8">Mentions légales</h1>

        <div className="bento-card space-y-8">
          {/* Éditeur */}
          <section>
            <h2 className="text-xl font-semibold text-[#0a0a0a] mb-3">Éditeur du site</h2>
            <p className="text-[#525252] leading-relaxed">
              Le site <strong>QRaft</strong> est édité par <strong>DVS Web</strong>, projet créé par <strong>Evan Davison</strong>.
            </p>
            <ul className="mt-3 text-[#525252] space-y-1">
              <li><strong>Raison sociale :</strong> DVS Web</li>
              <li><strong>Responsable de publication :</strong> Evan Davison</li>
            </ul>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="text-xl font-semibold text-[#0a0a0a] mb-3">Hébergement</h2>
            <p className="text-[#525252] leading-relaxed">
              Les informations relatives à l&apos;hébergeur seront ajoutées prochainement.
            </p>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-xl font-semibold text-[#0a0a0a] mb-3">Propriété intellectuelle</h2>
            <p className="text-[#525252] leading-relaxed">
              L&apos;ensemble du contenu de ce site (textes, images, code source, graphismes, logos) est la propriété exclusive de DVS Web (Evan Davison), sauf mention contraire. Toute reproduction, distribution ou utilisation sans autorisation préalable est interdite.
            </p>
          </section>

          {/* Données personnelles */}
          <section>
            <h2 className="text-xl font-semibold text-[#0a0a0a] mb-3">Protection des données personnelles</h2>
            <p className="text-[#525252] leading-relaxed">
              Les données personnelles collectées sur ce site (nom, adresse email) sont uniquement utilisées pour le fonctionnement du service de génération de QR codes. Elles ne sont ni cédées ni vendues à des tiers.
            </p>
            <p className="text-[#525252] leading-relaxed mt-2">
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. Pour exercer ces droits, vous pouvez supprimer votre compte ou contacter le responsable de publication.
            </p>
          </section>

          {/* Responsabilité */}
          <section>
            <h2 className="text-xl font-semibold text-[#0a0a0a] mb-3">Limitation de responsabilité</h2>
            <p className="text-[#525252] leading-relaxed">
              DVS Web s&apos;efforce de fournir des informations aussi précises que possible. Toutefois, il ne saurait être tenu responsable des omissions, inexactitudes ou carences dans la mise à jour des informations. L&apos;utilisateur est seul responsable de l&apos;utilisation qu&apos;il fait des QR codes générés via ce service.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-[#0a0a0a] mb-3">Cookies</h2>
            <p className="text-[#525252] leading-relaxed">
              Ce site utilise des cookies strictement nécessaires au fonctionnement du service, notamment pour la gestion de l&apos;authentification. Aucun cookie publicitaire ou de suivi n&apos;est utilisé.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-[#0a0a0a] hover:text-[#525252] font-medium text-sm inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-[#a3a3a3]">
          &copy; {new Date().getFullYear()} DVS Web (Evan Davison). Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}