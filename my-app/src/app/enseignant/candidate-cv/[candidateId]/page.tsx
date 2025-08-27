"use client";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

interface CVData {
  id: string;
  title: string;
  template: string;
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
}

export default function CandidateCV() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const candidateId = params.candidateId as string;
  
  const [cv, setCv] = useState<CVData | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "ENSEIGNANT") {
      router.push("/Auth/Signin");
      return;
    }
    fetchCandidateCV();
  }, [session, status, router, candidateId]);

  const fetchCandidateCV = async () => {
    try {
      const response = await fetch(`/api/enseignant/candidate-cv/${candidateId}`);
      if (response.ok) {
        const data = await response.json();
        setCv(data.cv);
        setCandidate(data.candidate);
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      console.error("Error fetching candidate CV:", error);
      setError("Erreur lors du chargement du CV");
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">CV non disponible</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      {/* Header - Hidden in print */}
      <div className="print:hidden bg-white/70 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CV du candidat</h1>
                <p className="text-sm text-gray-600">
                  {candidate?.prenom} {candidate?.nom} - {candidate?.specialite}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Imprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CV Content */}
      <div className="max-w-4xl mx-auto p-6 print:p-0">
        <div className="bg-white shadow-2xl print:shadow-none" id="cv-content">
          {/* Modern CV Template */}
          <div className="p-8 print:p-6">
            {/* Header */}
            <div className="border-b-2 border-red-600 pb-6 mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {cv?.personalInfo?.firstName || candidate?.prenom} {cv?.personalInfo?.lastName || candidate?.nom}
                  </h1>
                  <div className="text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{cv?.personalInfo?.email || candidate?.email}</span>
                    </div>
                    {(cv?.personalInfo?.phone || candidate?.telephone) && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{cv?.personalInfo?.phone || candidate?.telephone}</span>
                      </div>
                    )}
                    {(cv?.personalInfo?.address || cv?.personalInfo?.city) && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{cv?.personalInfo?.address} {cv?.personalInfo?.city}</span>
                      </div>
                    )}
                    {candidate?.specialite && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium text-red-600">{candidate.specialite}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right space-y-2">
                  {cv?.personalInfo?.linkedIn && (
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-sm text-gray-600">LinkedIn</span>
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                  )}
                  {cv?.personalInfo?.website && (
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-sm text-gray-600">Site web</span>
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            {cv?.personalInfo?.summary && (
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

            {/* Education Section */}
            {cv && cv.education && cv.education.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    </svg>
                  </div>
                  Formation
                </h2>
                <div className="space-y-4">
                  {cv.education.map((edu: any) => (
                    <div key={edu.id} className="border-l-4 border-red-600 pl-4">
                      <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-red-600 font-medium">{edu.institution}</p>
                      {edu.fieldOfStudy && <p className="text-gray-600">{edu.fieldOfStudy}</p>}
                      <p className="text-sm text-gray-500">
                        {new Date(edu.startDate).getFullYear()} - {edu.current ? "En cours" : new Date(edu.endDate).getFullYear()}
                      </p>
                      {edu.grade && <p className="text-sm text-gray-600">Note: {edu.grade}</p>}
                      {edu.description && <p className="text-gray-700 mt-2">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Section */}
            {cv && cv.experience && cv.experience.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
                    </svg>
                  </div>
                  Expérience professionnelle
                </h2>
                <div className="space-y-4">
                  {cv.experience.map((exp: any) => (
                    <div key={exp.id} className="border-l-4 border-red-600 pl-4">
                      <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-red-600 font-medium">{exp.company}</p>
                      {exp.location && <p className="text-gray-600">{exp.location}</p>}
                      <p className="text-sm text-gray-500">
                        {new Date(exp.startDate).getFullYear()} - {exp.current ? "En cours" : new Date(exp.endDate).getFullYear()}
                      </p>
                      {exp.description && <p className="text-gray-700 mt-2">{exp.description}</p>}
                      {exp.achievements && exp.achievements.length > 0 && (
                        <ul className="list-disc list-inside mt-2 text-gray-700">
                          {exp.achievements.map((achievement: string, index: number) => (
                            <li key={index}>{achievement}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {cv && cv.skills && cv.skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  Compétences
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cv.skills.reduce((acc: any, skill: any) => {
                    if (!acc[skill.category]) {
                      acc[skill.category] = [];
                    }
                    acc[skill.category].push(skill);
                    return acc;
                  }, {}) && Object.entries(cv.skills.reduce((acc: any, skill: any) => {
                    if (!acc[skill.category]) {
                      acc[skill.category] = [];
                    }
                    acc[skill.category].push(skill);
                    return acc;
                  }, {})).map(([category, skills]: [string, any]) => (
                    <div key={category} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">{category}</h3>
                      <div className="space-y-2">
                        {skills.map((skill: any) => (
                          <div key={skill.id} className="flex items-center justify-between">
                            <span className="text-gray-700">{skill.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-red-600 h-2 rounded-full"
                                  style={{ width: `${(skill.level / 5) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{skill.level}/5</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Section */}
            {cv && cv.languages && cv.languages.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </div>
                  Langues
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {cv.languages.map((lang: any) => (
                    <div key={lang.id} className="text-center">
                      <p className="font-medium text-gray-900">{lang.name}</p>
                      <p className="text-sm text-red-600">{lang.level}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {cv && cv.projects && cv.projects.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  Projets
                </h2>
                <div className="space-y-4">
                  {cv.projects.map((project: any) => (
                    <div key={project.id} className="border-l-4 border-red-600 pl-4">
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      {project.description && <p className="text-gray-700 mt-1">{project.description}</p>}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.technologies.map((tech: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Section */}
            {cv && cv.certifications && cv.certifications.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  Certifications
                </h2>
                <div className="space-y-4">
                  {cv.certifications.map((cert: any) => (
                    <div key={cert.id} className="border-l-4 border-red-600 pl-4">
                      <h3 className="text-lg font-semibold text-gray-900">{cert.name}</h3>
                      <p className="text-red-600 font-medium">{cert.issuer}</p>
                      <p className="text-sm text-gray-500">
                        Obtenu le {new Date(cert.issueDate).toLocaleDateString('fr-FR')}
                        {cert.expiryDate && ` • Expire le ${new Date(cert.expiryDate).toLocaleDateString('fr-FR')}`}
                      </p>
                      {cert.credentialId && <p className="text-sm text-gray-600">ID: {cert.credentialId}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No CV message */}
            {!cv?.personalInfo?.summary && (!cv?.education || cv.education.length === 0) && 
             (!cv?.experience || cv.experience.length === 0) && (!cv?.skills || cv.skills.length === 0) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">CV en cours de construction</h3>
                <p className="text-gray-600">Le candidat n'a pas encore complété son CV.</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>CV consulté le {new Date().toLocaleDateString('fr-FR')} - Entretien avec {session?.user?.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
