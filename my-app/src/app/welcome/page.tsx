"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function WelcomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.role === 'CANDIDAT') {
      fetch('/api/reservation?mine=1').then(res => res.json()).then(data => {
        if (data.reservations?.some((r: any) => r.status === 'TERMINEE')) {
          signOut({ callbackUrl: '/Auth/Signin' });
        }
      });
    }
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/Auth/Signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Custom message for Etudiant
  if (session.user?.role === 'ETUDIANT') {
    return (
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center mx-auto mt-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-green-800 mb-4">Félicitations !</h1>
        <p className="text-lg text-gray-700 mb-6">
          Vous avez terminé votre entretien d'admission avec succès.<br />
          Vous êtes maintenant officiellement étudiant(e) !
        </p>
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations de votre compte:</h2>
          <div className="space-y-2 text-left">
            <p><span className="font-medium">Email:</span> {session.user?.email}</p>
            <p><span className="font-medium">Nom:</span> {session.user?.name || "Non spécifié"}</p>
            <p><span className="font-medium">Rôle:</span> 
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🎓 Étudiant
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 mx-auto mt-12">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Bienvenue, {session.user?.name || session.user?.email}!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Votre connexion a été réussie. Vous êtes maintenant connecté à votre compte.
        </p>
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations de votre compte:</h2>
          <div className="space-y-2 text-left">
            <p><span className="font-medium">Email:</span> {session.user?.email}</p>
            <p><span className="font-medium">Nom:</span> {session.user?.name || "Non spécifié"}</p>
            <p><span className="font-medium">Rôle:</span> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                session.user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                session.user?.role === 'ENSEIGNANT' ? 'bg-blue-100 text-blue-800' :
                session.user?.role === 'ETUDIANT' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {session.user?.role === 'ADMIN' ? '👑 Administrateur' :
                 session.user?.role === 'ENSEIGNANT' ? '👨‍🏫 Enseignant' :
                 session.user?.role === 'ETUDIANT' ? '🎓 Étudiant' : '👤 Candidat'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 