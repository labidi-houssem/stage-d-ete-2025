"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface UserProfile {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  cin: string;
  telephone: string;
  specialite: string;
  gouvernorat: string;
  createdAt: string;
}

export default function EtudiantDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/Auth/Signin");
      return;
    }
    
    if (session.user?.role !== "ETUDIANT") {
      router.push("/welcome");
      return;
    }

    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/etudiant/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de Bord Étudiant
          </h1>
          <p className="text-gray-600">
            Bienvenue dans votre espace étudiant
          </p>
        </div>

        {/* Welcome Card */}
        {profile && (
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  🎓 Félicitations {profile.prenom} {profile.nom} !
                </h2>
                <p className="text-red-100">
                  Vous êtes maintenant un étudiant admis. Votre entretien a été conclu avec succès.
                </p>
                <p className="text-red-100 mt-2">
                  <strong>Spécialité:</strong> {profile.specialite || "Non renseignée"} | 
                  <strong> Gouvernorat:</strong> {profile.gouvernorat || "Non renseigné"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-sm text-red-100">
                  Admis le {formatDate(profile.createdAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/etudiant/cv">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mon CV
              </h3>
              <p className="text-gray-600">
                Consultez et modifiez votre CV professionnel
              </p>
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Statut d'Admission
            </h3>
            <p className="text-gray-600">
              Votre admission a été confirmée avec succès
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✅ Admis
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Informations Académiques
            </h3>
            <p className="text-gray-600">
              Accédez à vos informations de formation
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                📚 {profile?.specialite || "Spécialité à définir"}
              </span>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informations Personnelles
            </h2>
            {profile && (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Nom complet:</span>
                  <span className="font-medium">{profile.prenom} {profile.nom}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{profile.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Téléphone:</span>
                  <span className="font-medium">{profile.telephone || "Non renseigné"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">CIN:</span>
                  <span className="font-medium">{profile.cin || "Non renseigné"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Gouvernorat:</span>
                  <span className="font-medium">{profile.gouvernorat || "Non renseigné"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Membre depuis:</span>
                  <span className="font-medium">{formatDate(profile.createdAt)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informations Académiques
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">🎓 Statut d'Admission</h3>
                <p className="text-blue-700">
                  Votre candidature a été acceptée et vous êtes maintenant un étudiant admis.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">✅ Entretien Réussi</h3>
                <p className="text-green-700">
                  Votre entretien d'admission s'est déroulé avec succès.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">📚 Spécialité</h3>
                <p className="text-purple-700">
                  {profile?.specialite || "Votre spécialité sera définie prochainement"}
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium text-orange-900 mb-2">📅 Prochaines Étapes</h3>
                <p className="text-orange-700">
                  Vous recevrez bientôt des informations sur les prochaines étapes de votre formation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Besoin d'Aide ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">📧 Contact Administratif</h3>
              <p className="text-gray-600 mb-2">
                Pour toute question administrative concernant votre admission :
              </p>
              <p className="text-blue-600 font-medium">admin@institut.com</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">📞 Support Technique</h3>
              <p className="text-gray-600 mb-2">
                Pour toute question technique concernant votre compte :
              </p>
              <p className="text-blue-600 font-medium">support@institut.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 