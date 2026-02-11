import Link from "next/link";
import Image from "next/image";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://qr-aft.vercel.app/#app",
      name: "QRaft",
      url: "https://qr-aft.vercel.app",
      description:
        "Créez des QR codes personnalisés gratuitement en quelques secondes. Ajoutez votre logo, choisissez vos couleurs, exportez en PNG, JPEG ou PDF.",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript",
      softwareVersion: "1.0",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
      },
      featureList: [
        "Génération de QR codes illimitée",
        "Personnalisation des couleurs",
        "Ajout de logo personnalisé",
        "Export PNG, JPEG, PDF",
        "Partage par lien public",
        "4 niveaux de correction d'erreur",
      ],
      screenshot: "https://qr-aft.vercel.app/QRaft.png",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        ratingCount: "1",
        bestRating: "5",
        worstRating: "1",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://qr-aft.vercel.app/#organization",
      name: "DVS Web",
      url: "https://qr-aft.vercel.app",
      logo: "https://qr-aft.vercel.app/QRaft.png",
      founder: {
        "@type": "Person",
        name: "Evan Davison",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://qr-aft.vercel.app/#website",
      url: "https://qr-aft.vercel.app",
      name: "QRaft",
      description: "Générateur de QR codes gratuit et personnalisable",
      publisher: {
        "@id": "https://qr-aft.vercel.app/#organization",
      },
      inLanguage: "fr-FR",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "QRaft est-il vraiment gratuit ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Oui, QRaft est 100% gratuit. Vous pouvez créer des QR codes illimités, les personnaliser avec vos couleurs et votre logo, et les exporter en PNG, JPEG ou PDF sans aucun frais.",
          },
        },
        {
          "@type": "Question",
          name: "Puis-je ajouter mon logo sur un QR code ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Oui, QRaft vous permet d'ajouter votre logo au centre de votre QR code pour une personnalisation complète de votre marque.",
          },
        },
        {
          "@type": "Question",
          name: "Quels formats d'export sont disponibles ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "QRaft propose l'export en 3 formats : PNG pour le web, JPEG pour l'impression standard, et PDF pour une qualité vectorielle.",
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navbar */}
      <nav className="navbar">
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
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost btn-sm">
              Connexion
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="badge badge-emerald mb-4">100% Gratuit</span>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-[#0a0a0a] leading-[1.1]">
            Créez des QR codes<br />
            <span className="text-gradient-emerald">en quelques secondes</span>
          </h1>
          <p className="mt-6 text-lg text-[#525252] max-w-xl mx-auto">
            Générez, personnalisez et partagez vos QR codes. Simple, rapide, et totalement gratuit.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/register" className="btn btn-primary btn-lg">
              Créer mon premier QR
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bento-grid">

          {/* Hero Card - QR Preview */}
          <div className="bento-card span-2 row-2 dark flex flex-col justify-between p-8">
            <div>
              <span className="badge bg-white/10 text-white mb-4">Aperçu</span>
              <h3 className="text-2xl font-bold mb-2">Visualisation en temps réel</h3>
              <p className="text-white/70">Voyez votre QR code se mettre à jour instantanément.</p>
            </div>
            <div className="flex justify-center mt-8">
              <div className="bg-white rounded-2xl p-6 animate-float">
                <svg viewBox="0 0 100 100" className="w-32 h-32">
                  <rect fill="#0a0a0a" x="10" y="10" width="20" height="20" rx="2"/>
                  <rect fill="#0a0a0a" x="70" y="10" width="20" height="20" rx="2"/>
                  <rect fill="#0a0a0a" x="10" y="70" width="20" height="20" rx="2"/>
                  <rect fill="#0a0a0a" x="40" y="10" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="52" y="10" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="40" y="22" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="10" y="40" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="22" y="40" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="10" y="52" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="40" y="40" width="20" height="20" rx="4"/>
                  <rect fill="#0a0a0a" x="70" y="40" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="82" y="40" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="70" y="52" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="40" y="70" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="52" y="70" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="40" y="82" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="70" y="70" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="82" y="70" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="70" y="82" width="8" height="8" rx="1"/>
                  <rect fill="#0a0a0a" x="82" y="82" width="8" height="8" rx="1"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Stat Card 1 */}
          <div className="bento-card gradient p-6">
            <p className="stat-number">∞</p>
            <p className="text-white/80 mt-2 font-medium">QR codes illimités</p>
          </div>

          {/* Stat Card 2 */}
          <div className="bento-card p-6">
            <p className="stat-number text-[#0a0a0a]">3</p>
            <p className="text-[#525252] mt-2 font-medium">Formats d'export</p>
            <div className="flex gap-2 mt-4">
              <span className="badge badge-gray">PNG</span>
              <span className="badge badge-gray">JPG</span>
              <span className="badge badge-gray">PDF</span>
            </div>
          </div>

          {/* Feature: Colors */}
          <div className="bento-card p-6">
            <div className="flex gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#0a0a0a]"></div>
              <div className="w-8 h-8 rounded-full bg-[#10b981]"></div>
              <div className="w-8 h-8 rounded-full bg-[#8b5cf6]"></div>
              <div className="w-8 h-8 rounded-full bg-[#f97316]"></div>
            </div>
            <h3 className="font-bold text-lg text-[#0a0a0a]">Couleurs</h3>
            <p className="text-[#525252] text-sm mt-1">Personnalisez chaque détail</p>
          </div>

          {/* Feature: Logo */}
          <div className="bento-card gradient-purple p-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg">Ajoutez votre logo</h3>
            <p className="text-white/80 text-sm mt-1">Au centre du QR code</p>
          </div>

          {/* Feature: Share */}
          <div className="bento-card p-6">
            <div className="icon-box emerald mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-[#0a0a0a]">Partage facile</h3>
            <p className="text-[#525252] text-sm mt-1">Lien public en un clic</p>
          </div>

          {/* Feature: Batch Export */}
          <div className="bento-card span-2 p-6 flex items-center gap-6">
            <div className="icon-box dark shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0a0a0a]">Export en masse</h3>
              <p className="text-[#525252] text-sm mt-1">Téléchargez tous vos QR codes en une archive ZIP</p>
            </div>
          </div>

          {/* Feature: Error Correction */}
          <div className="bento-card p-6">
            <div className="flex gap-1 mb-4">
              <span className="w-6 h-6 rounded bg-[#e5e5e5] text-xs flex items-center justify-center font-bold">L</span>
              <span className="w-6 h-6 rounded bg-[#d4d4d4] text-xs flex items-center justify-center font-bold">M</span>
              <span className="w-6 h-6 rounded bg-[#a3a3a3] text-white text-xs flex items-center justify-center font-bold">Q</span>
              <span className="w-6 h-6 rounded bg-[#0a0a0a] text-white text-xs flex items-center justify-center font-bold">H</span>
            </div>
            <h3 className="font-bold text-lg text-[#0a0a0a]">Correction d'erreur</h3>
            <p className="text-[#525252] text-sm mt-1">4 niveaux de redondance</p>
          </div>

          {/* CTA Card */}
          <div className="bento-card span-4 gradient-orange p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Prêt à créer votre premier QR code ?</h3>
            <p className="text-white/80 mb-6">Inscrivez-vous gratuitement et commencez en quelques secondes.</p>
            <Link href="/register" className="btn bg-white text-[#f97316] hover:bg-white/90 btn-lg">
              Créer mon compte gratuit
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#525252]">
          <span>&copy; 2026 QRaft — Propulsé par <a href="https://dvs-web.fr" target="_blank" rel="noopener noreferrer" className="hover:text-[#0a0a0a] underline">DVS-Web</a>. Tous droits réservés.</span>
          <Link href="/mentions-legales" className="hover:text-[#0a0a0a] transition">
            Mentions légales
          </Link>
        </div>
      </footer>
    </div>
  );
}
