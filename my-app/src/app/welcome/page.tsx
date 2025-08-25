"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export default function WelcomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [myReservations, setMyReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "CANDIDAT") {
      fetch("/api/reservation?mine=1")
        .then(res => res.json())
        .then(data => setMyReservations(data.reservations || []))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/Auth/Signin");
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-6 text-xl font-medium text-gray-700">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // If candidate has a reservation with result REFUSER, show only the result
  if (session?.user?.role === "CANDIDAT") {
    const refusedReservation = myReservations.find(r => r.result === 'REFUSER');
    if (refusedReservation) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Résultat de votre entretien</h2>
                <p className="text-red-100 text-lg">Votre candidature n'a pas été retenue</p>
              </div>
            </div>
            <div className="p-8 text-center">
              <div className="mb-8">
                <div className="inline-flex items-center px-6 py-3 bg-red-100 rounded-full mb-6">
                  <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-red-800 font-bold text-lg">Refusé</span>
                </div>
                <p className="text-gray-600 text-lg mb-6">
                  Malheureusement, votre candidature n'a pas été retenue pour cette session d'admission.<br />
                  <span className="font-medium text-red-600">Vous ne pouvez plus réserver d'autres entretiens.</span>
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Détails de l'entretien
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">📅 Date</div>
                    <div className="font-medium text-gray-900">
                      {new Date(refusedReservation.disponibilite?.dateDebut).toLocaleDateString("fr-FR", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">🕐 Heure</div>
                    <div className="font-medium text-gray-900">
                      {new Date(refusedReservation.disponibilite?.dateDebut).toLocaleTimeString("fr-FR", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">👨‍🏫 Enseignant</div>
                    <div className="font-medium text-gray-900">
                      {refusedReservation.disponibilite?.enseignant?.prenom} {refusedReservation.disponibilite?.enseignant?.nom}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">📊 Statut</div>
                    <div className="font-medium text-gray-900">{refusedReservation.status}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => signOut()}
                className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🚪 Se déconnecter
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Custom message for Etudiant
  if (session.user?.role === 'ETUDIANT') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">🎉 Félicitations !</h1>
              <p className="text-green-100 text-xl">Votre admission a été validée avec succès</p>
            </div>
          </div>
          <div className="p-8 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-green-100 rounded-full mb-6">
                <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800 font-bold text-lg">Admis(e) !</span>
              </div>
              <p className="text-gray-700 text-xl mb-6">
                Vous avez terminé votre entretien d'admission avec succès.<br />
                <span className="font-bold text-green-600">Vous êtes maintenant officiellement étudiant(e) !</span>
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 mb-8 border border-green-200">
              <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center justify-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Informations de votre compte
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-green-200">
                  <div className="text-sm text-green-600 mb-1 font-medium">📧 Email</div>
                  <div className="font-bold text-gray-900">{session.user?.email}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-green-200">
                  <div className="text-sm text-green-600 mb-1 font-medium">👤 Nom</div>
                  <div className="font-bold text-gray-900">{session.user?.name || "Non spécifié"}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-green-200">
                  <div className="text-sm text-green-600 mb-1 font-medium">🎯 Rôle</div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    🎓 Étudiant
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => signOut()}
                className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🚪 Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default welcome message for other roles
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Bienvenue, {session.user?.name || session.user?.email}!
            </h1>
            <p className="text-red-100 text-xl">Votre connexion a été réussie</p>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-6 py-3 bg-green-100 rounded-full mb-6">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 font-bold text-lg">Connexion réussie</span>
            </div>
            <p className="text-gray-700 text-xl mb-6">
              Vous êtes maintenant connecté à votre compte ESPRIT.<br />
              Accédez à toutes les fonctionnalités de la plateforme.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 mb-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center justify-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Informations de votre compte
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-blue-200">
                <div className="text-sm text-blue-600 mb-1 font-medium">📧 Email</div>
                <div className="font-bold text-gray-900">{session.user?.email}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-200">
                <div className="text-sm text-blue-600 mb-1 font-medium">👤 Nom</div>
                <div className="font-bold text-gray-900">{session.user?.name || "Non spécifié"}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-200">
                <div className="text-sm text-blue-600 mb-1 font-medium">🎯 Rôle</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  session.user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                  session.user?.role === 'ENSEIGNANT' ? 'bg-blue-100 text-blue-800' :
                  session.user?.role === 'ETUDIANT' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {session.user?.role === 'ADMIN' ? '👑 Administrateur' :
                   session.user?.role === 'ENSEIGNANT' ? '👨‍🏫 Enseignant' :
                   session.user?.role === 'ETUDIANT' ? '🎓 Étudiant' : '👤 Candidat'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => signOut()}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🚪 Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 