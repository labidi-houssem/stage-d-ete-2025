"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface CVData {
  id: string;
  title: string;
  template: string;
  isPublic: boolean;
  personalInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    summary: string;
  };
  completionPercentage: number;
}

export default function CandidatDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cv, setCv] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/Auth/Signin");
      return;
    }
    if (session.user?.role !== "CANDIDAT") {
      router.push("/welcome");
      return;
    }
    fetchCV();
  }, [session, status, router]);

  const fetchCV = async () => {
    try {
      const response = await fetch("/api/candidat/cv");
      if (response.ok) {
        const data = await response.json();
        setCv(data.cv);
      }
    } catch (error) {
      console.error("Error fetching CV:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewCV = async () => {
    try {
      const response = await fetch("/api/candidat/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Mon CV",
          template: "modern"
        })
      });
      if (response.ok) {
        const data = await response.json();
        router.push(`/candidat/cv-builder/${data.cv.id}`);
      }
    } catch (error) {
      console.error("Error creating CV:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-700">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Message */}
        {showWelcome && (
          <div className="mb-6 sm:mb-8 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors touch-target"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
                  Bienvenue, {session?.user?.name || "Candidat"} ! 👋
                </h1>
                <p className="text-red-100 text-sm sm:text-base lg:text-lg">
                  Créez votre CV professionnel et préparez-vous pour vos entretiens
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!cv ? (
          /* No CV - Show CV Builder Introduction */
          <div className="text-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8 lg:p-12 mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-red-600 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Créez votre CV professionnel
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Utilisez notre constructeur de CV moderne pour créer un CV impressionnant qui vous démarquera lors de vos entretiens.
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 5l4 4" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Design Moderne</h3>
                  <p className="text-sm sm:text-base text-gray-600">Templates professionnels et élégants</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Facile à utiliser</h3>
                  <p className="text-sm sm:text-base text-gray-600">Interface intuitive et simple</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Sécurisé</h3>
                  <p className="text-sm sm:text-base text-gray-600">Vos données sont protégées</p>
                </div>
              </div>

              <button
                onClick={createNewCV}
                className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 focus:ring-4 focus:ring-red-200 focus:outline-none transition-all duration-200 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 touch-target"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Créer mon CV maintenant
              </button>
            </div>
          </div>
        ) : (
          /* Has CV - Show CV Management */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* CV Preview Card */}
            <div className="lg:col-span-2">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Mon CV</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{cv.completionPercentage}% complété</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{cv.title}</h3>
                  <p className="text-gray-600 mb-3 sm:mb-4">
                    {cv.personalInfo?.firstName} {cv.personalInfo?.lastName}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-600 to-rose-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${cv.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => router.push(`/candidat/cv-builder/${cv.id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium touch-target"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier mon CV
                  </button>
                  <button
                    onClick={() => router.push(`/candidat/cv-preview/${cv.id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium touch-target"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Aperçu
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Actions rapides</h3>
                <div className="space-y-2 sm:space-y-3">
                  <a
                    href="/candidat/profile"
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors touch-target"
                  >
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">Mon profil</span>
                  </a>
                  <a
                    href="/candidat/interviews"
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors touch-target"
                  >
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">Mes entretiens</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
