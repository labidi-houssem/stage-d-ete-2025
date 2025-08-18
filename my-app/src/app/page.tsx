import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-red-100 via-white to-red-200 flex flex-col items-center justify-center">
      {/* Logo and Hero Section */}
      <section className="w-full flex flex-col items-center justify-center py-20 px-4 relative z-10">
        <div className="absolute inset-0 pointer-events-none select-none">
          <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 w-full h-full">
            <path fill="#DC2626" fillOpacity="0.08" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
          </svg>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center">
          <div className="mb-6 flex flex-col items-center">
            <Image
              src="/images/logo/logo.jpg"
              alt="Logo"
              width={150}
              height={150}
              className="rounded-full shadow-lg border-4 border-white bg-white"
              priority
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-red-700 mb-4 drop-shadow-lg">
            Plateforme de gestion des entretiens
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 font-medium">
            Simplifiez la gestion des entretiens pour les candidats, enseignants et administrateurs.<br/>
            <span className="text-red-600 font-semibold">Réservez, gérez, soyez notifié en temps réel.</span>
          </p>
          <a
            href="/Auth/Signin"
            className="inline-block px-10 py-4 bg-red-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-red-700 transition"
          >
            Se connecter
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-4xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-3 gap-8 z-10">
        <div className="flex flex-col items-center text-center bg-white rounded-xl shadow p-6 hover:shadow-xl transition">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="font-bold text-lg mb-2 text-red-700">Réservations Faciles</h3>
          <p className="text-gray-600">Réservez et gérez vos entretiens en quelques clics, avec une interface intuitive.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white rounded-xl shadow p-6 hover:shadow-xl transition">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
          <h3 className="font-bold text-lg mb-2 text-red-700">Notifications en Temps Réel</h3>
          <p className="text-gray-600">Recevez des notifications instantanées pour chaque mise à jour ou nouvelle réservation.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white rounded-xl shadow p-6 hover:shadow-xl transition">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 018 0v2m-4-4V7m0 0a4 4 0 00-8 0v4a4 4 0 008 0z" /></svg>
          </div>
          <h3 className="font-bold text-lg mb-2 text-red-700">Gestion Centralisée</h3>
          <p className="text-gray-600">Un tableau de bord unique pour administrer utilisateurs, entretiens et statistiques.</p>
    </div>
      </section>

      <footer className="mt-16 mb-6 text-gray-500 text-sm text-center z-10">
        &copy; {new Date().getFullYear()} Plateforme Entretiens. Tous droits réservés.
      </footer>
    </main>
  );
}
