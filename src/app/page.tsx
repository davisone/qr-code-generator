import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-9 h-9 bg-indigo-100 rounded-lg">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">QR Generator</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
          Créez des QR codes<br />
          <span className="text-indigo-600">personnalisés en quelques clics</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Générez, personnalisez et partagez vos QR codes facilement.
          URL, texte, couleurs, logo — tout est configurable.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-6 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
          >
            Commencer gratuitement
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition"
          >
            Se connecter
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
          Tout ce dont vous avez besoin
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg mb-4">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Personnalisation complète</h3>
            <p className="text-gray-600 text-sm">
              Choisissez vos couleurs, appliquez des thèmes prédéfinis et ajoutez votre logo pour un QR code à votre image.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg mb-4">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export multi-formats</h3>
            <p className="text-gray-600 text-sm">
              Téléchargez vos QR codes en PNG, JPEG ou PDF. Exportez plusieurs QR codes d&apos;un coup en archive ZIP.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg mb-4">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Partage facile</h3>
            <p className="text-gray-600 text-sm">
              Générez un lien public pour partager vos QR codes avec n&apos;importe qui, sans qu&apos;ils aient besoin d&apos;un compte.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg mb-4">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">URL & Texte</h3>
            <p className="text-gray-600 text-sm">
              Encodez des liens web ou du texte libre. Idéal pour vos cartes de visite, flyers, menus ou événements.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg mb-4">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Favoris & Organisation</h3>
            <p className="text-gray-600 text-sm">
              Marquez vos QR codes favoris, recherchez par nom ou contenu, et filtrez par type pour rester organisé.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg mb-4">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Niveaux de correction</h3>
            <p className="text-gray-600 text-sm">
              Ajustez le niveau de correction d&apos;erreur (L, M, Q, H) pour garantir la lisibilité même si le QR code est partiellement abîmé.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-indigo-600 rounded-2xl p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Prêt à créer votre premier QR code ?
          </h2>
          <p className="text-indigo-100 mb-8 max-w-lg mx-auto">
            Inscrivez-vous gratuitement et commencez à générer des QR codes personnalisés en quelques secondes.
          </p>
          <Link
            href="/register"
            className="inline-block px-6 py-3 text-base font-medium text-indigo-600 bg-white hover:bg-indigo-50 rounded-lg transition shadow-sm"
          >
            Créer mon compte
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>&copy; {new Date().getFullYear()} DVS Web (Evan Davison). Tous droits réservés.</span>
          <Link href="/mentions-legales" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Mentions légales
          </Link>
        </div>
      </footer>
    </div>
  );
}