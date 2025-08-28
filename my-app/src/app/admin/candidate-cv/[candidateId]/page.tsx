"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface CVData {
  id: string;
  title: string;
  personalInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    summary: string;
    linkedIn: string;
    website: string;
  };
  education: any[];
  experience: any[];
  skills: any[];
  languages: any[];
  projects: any[];
  certifications: any[];
}

interface Candidate {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  specialite: string;
  telephone: string;
  createdAt: string;
}

export default function AdminCandidateCV({ params }: { params: { candidateId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cv, setCv] = useState<CVData | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/Auth/Signin");
      return;
    }
    fetchCandidateCV();
  }, [session, status, router, params.candidateId]);

  const fetchCandidateCV = async () => {
    try {
      const response = await fetch(`/api/admin/candidate-cv/${params.candidateId}`);
      if (response.ok) {
        const data = await response.json();
        setCv(data.cv);
        setCandidate(data.candidate);
      } else {
        router.push("/admin/candidates-cv");
      }
    } catch (error) {
      console.error("Error fetching candidate CV:", error);
      router.push("/admin/candidates-cv");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-700">Chargement du CV...</p>
        </div>
      </div>
    );
  }

  if (!cv || !candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">CV non trouvé</h1>
          <p className="text-gray-600 mb-6">Ce candidat n'a pas encore créé de CV.</p>
          <button
            onClick={() => router.push("/admin/candidates-cv")}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 print:bg-white">
      <div className="max-w-4xl mx-auto p-6 print:p-0">
        {/* Header - Hidden in print */}
        <div className="mb-8 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin/candidates-cv")}
                className="w-12 h-12 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center hover:bg-white/90 transition-all duration-200"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent">
                  CV de {candidate.prenom} {candidate.nom}
                </h1>
                <p className="text-gray-600">Consultation administrative</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="px-6 py-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/90 transition-all duration-200 font-medium text-gray-700"
              >
                🖨️ Imprimer
              </button>
            </div>
          </div>
        </div>

        {/* CV Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 print:shadow-none print:border-none print:bg-white">
          <div className="p-8 print:p-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-8 mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {cv.personalInfo?.firstName || candidate.prenom} {cv.personalInfo?.lastName || candidate.nom}
                  </h1>
                  <p className="text-xl text-red-600 font-medium mb-4">{candidate.specialite}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{cv.personalInfo?.email || candidate.email}</span>
                    </div>
                    {(cv.personalInfo?.phone || candidate.telephone) && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{cv.personalInfo?.phone || candidate.telephone}</span>
                      </div>
                    )}
                    {cv.personalInfo?.address && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{cv.personalInfo.address}{cv.personalInfo.city && `, ${cv.personalInfo.city}`}</span>
                      </div>
                    )}
                    {cv.personalInfo?.linkedIn && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span>LinkedIn</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Admin Info Badge */}
                <div className="text-right print:hidden">
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                    👨‍💼 Vue Administrateur
                  </div>
                  <p className="text-sm text-gray-500">
                    Candidat inscrit le {new Date(candidate.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            {cv.personalInfo?.summary && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  Profil professionnel
                </h2>
                <p className="text-gray-700 leading-relaxed">{cv.personalInfo.summary}</p>
              </div>
            )}

            {/* Rest of CV sections - same as the teacher view but with admin styling */}
            {/* Education, Experience, Skills, Languages, Projects, Certifications sections */}
            {/* ... (same content as teacher CV view) ... */}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>CV consulté par l'administration le {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
