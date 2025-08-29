import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50">
      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Image
                src="/images/logo/logo.png"
                alt="Logo ESPRIT"
                width={90}
                height={60}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                ESPRIT - Entretiens
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/Auth/Signin"
                className="px-4 py-2 text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/Auth/Signup"
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="grid grid-cols-12 gap-4 h-full">
              {Array.from({ length: 144 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-red-600 rounded-lg animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '4s'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="bg-gradient-to-r from-red-700 via-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Plateforme d'entretiens
                </span>
                <br />
                <span className="text-gray-800">
                  ESPRIT
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                École Supérieure Privée d'Ingénierie et de Technologies - Plateforme dédiée aux entretiens
                pour candidats, enseignants et administration. Accréditée EUR-ACE et associée à CGE, CDIO, AUF et UNESCO.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/Auth/Signup"
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Commencer gratuitement
                </Link>
                <Link
                  href="/Auth/Signin"
                  className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-red-300 hover:text-red-600 font-semibold text-lg transition-all duration-200"
                >
                  Se connecter
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">4</div>
                  <div className="text-sm text-gray-600">Spécialités</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">25%</div>
                  <div className="text-sm text-gray-600">Ingénieurs Tunisie</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">EUR-ACE</div>
                  <div className="text-sm text-gray-600">Accréditation</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative z-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="space-y-6">
                  {/* Mock Dashboard */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg"></div>
                    <span className="font-semibold text-gray-800">Tableau de bord</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Entretien confirmé</span>
                      </div>
                      <span className="text-xs text-gray-500">14:30</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-medium">En attente</span>
                      </div>
                      <span className="text-xs text-gray-500">16:00</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Nouveau candidat</span>
                      </div>
                      <span className="text-xs text-gray-500">Maintenant</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-red-400 to-rose-400 rounded-2xl opacity-20 animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-pink-400 to-red-400 rounded-xl opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Formations et spécialités ESPRIT
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              École d'ingénieurs privée accréditée proposant 4 spécialités d'excellence avec une plateforme d'entretiens intégrée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Informatique */}
            <div className="group p-8 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Informatique</h3>
              <p className="text-gray-600 leading-relaxed">
                Formation d'ingénieurs en informatique agréée par l'état. Intelligence artificielle, cybersécurité, big data et technologies innovantes.
              </p>
            </div>

            {/* Feature 2 - Télécommunications */}
            <div className="group p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Télécommunications</h3>
              <p className="text-gray-600 leading-relaxed">
                Spécialité en télécommunications et réseaux. Formation aux technologies de communication modernes et systèmes embarqués.
              </p>
            </div>

            {/* Feature 3 - Électromécanique */}
            <div className="group p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Électromécanique</h3>
              <p className="text-gray-600 leading-relaxed">
                Formation en génie électromécanique alliant électricité et mécanique. Automatisation industrielle et systèmes mécaniques.
              </p>
            </div>

            {/* Feature 4 - Génie Civil */}
            <div className="group p-8 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Génie Civil</h3>
              <p className="text-gray-600 leading-relaxed">
                Spécialité en génie civil et construction. Conception, calcul et réalisation d'ouvrages d'art et bâtiments.
              </p>
            </div>

            {/* Feature 5 - Accréditations */}
            <div className="group p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accréditation EUR-ACE</h3>
              <p className="text-gray-600 leading-relaxed">
                Formation accréditée EUR-ACE, gage d'excellence internationale. Seule école en Tunisie associée à CGE, CDIO, AUF et UNESCO.
              </p>
            </div>

            {/* Feature 6 - Plateforme Entretiens */}
            <div className="group p-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gestion d'Entretiens</h3>
              <p className="text-gray-600 leading-relaxed">
                Plateforme dédiée à la gestion des entretiens ESPRIT. Planification, suivi et évaluation des candidats en temps réel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Rejoignez ESPRIT
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Accédez à la plateforme d'entretiens de l'École Supérieure Privée d'Ingénierie et de Technologies.
            1 ingénieur sur 4 formé en Tunisie est diplômé d'ESPRIT.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/Auth/Signup"
              className="px-8 py-4 bg-white text-red-600 rounded-xl hover:bg-gray-50 font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Créer un compte
            </Link>
            <Link
              href="/Auth/Signin"
              className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-red-600 font-semibold text-lg transition-all duration-200"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src="/images/logo/logo.png"
                  alt="Logo ESPRIT"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
                <span className="text-2xl font-bold">ESPRIT</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                École Supérieure Privée d'Ingénierie et de Technologies.
                Formation d'excellence accréditée EUR-ACE avec plateforme d'entretiens intégrée.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/Auth/Signin" className="hover:text-white transition-colors">Se connecter</Link></li>
                <li><Link href="/Auth/Signup" className="hover:text-white transition-colors">S'inscrire</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">À propos</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Conditions</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ESPRIT - École Supérieure Privée d'Ingénierie et de Technologies. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
