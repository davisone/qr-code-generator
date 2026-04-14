import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site QRaft, édité par DVS Web (Evan Davison). Informations sur l'éditeur, la propriété intellectuelle et la protection des données.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://qr-aft.vercel.app/mentions-legales",
  },
};

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navbar */}
      <nav className="navbar sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="logo">
            <Image
              src="/QRaft.png"
              alt="QRaft"
              width={32}
              height={32}
              className="rounded-lg"
            />
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
              Le site est hébergé par <strong>Vercel Inc.</strong>
            </p>
            <ul className="mt-3 text-[#525252] space-y-1">
              <li><strong>Raison sociale :</strong> Vercel Inc.</li>
              <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
              <li><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#0a0a0a]">vercel.com</a></li>
            </ul>
            <p className="text-[#525252] leading-relaxed mt-3">
              La base de données est hébergée par <strong>Supabase Inc.</strong>
            </p>
            <ul className="mt-3 text-[#525252] space-y-1">
              <li><strong>Raison sociale :</strong> Supabase Inc.</li>
              <li><strong>Adresse :</strong> 970 Toa Payoh North #07-04, Singapore 318992</li>
              <li><strong>Site web :</strong> <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#0a0a0a]">supabase.com</a></li>
            </ul>
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

          {/* Tracking des QR codes */}
          <section>
            <h2 className="text-xl font-semibold text-[#0a0a0a] mb-3">Statistiques de scan des QR codes</h2>
            <p className="text-[#525252] leading-relaxed">
              Lorsqu&apos;un QR code partagé publiquement est scanné, nous collectons des données anonymes à des fins statistiques pour permettre au créateur du QR code de suivre l&apos;utilisation de celui-ci.
            </p>
            <p className="text-[#525252] leading-relaxed mt-3">
              <strong>Données collectées lors d&apos;un scan :</strong>
            </p>
            <ul className="mt-2 text-[#525252] space-y-1 list-disc list-inside">
              <li>Date et heure du scan</li>
              <li>Type d&apos;appareil (mobile, tablette, ordinateur)</li>
              <li>Navigateur utilisé (Chrome, Safari, Firefox, etc.)</li>
              <li>Système d&apos;exploitation (iOS, Android, Windows, macOS, etc.)</li>
              <li>Adresse IP (utilisée pour la géolocalisation approximative, non stockée de manière identifiable)</li>
              <li>Localisation approximative (pays, ville) déduite de l&apos;adresse IP</li>
            </ul>
            <p className="text-[#525252] leading-relaxed mt-3">
              <strong>Finalité :</strong> Ces données sont utilisées exclusivement pour fournir des statistiques de scan aux créateurs de QR codes (nombre de scans, répartition par appareil, etc.).
            </p>
            <p className="text-[#525252] leading-relaxed mt-2">
              <strong>Base légale :</strong> Intérêt légitime du créateur du QR code à connaître l&apos;utilisation de son contenu.
            </p>
            <p className="text-[#525252] leading-relaxed mt-2">
              <strong>Durée de conservation :</strong> Les données de scan sont conservées tant que le QR code existe. Elles sont supprimées automatiquement lors de la suppression du QR code.
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

    </div>
  );
}