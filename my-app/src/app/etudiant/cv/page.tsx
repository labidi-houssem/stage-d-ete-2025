"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

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
    address: string;
    city: string;
    country: string;
    summary: string;
    linkedIn: string;
    github: string;
    website: string;
  };
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    current: boolean;
    grade: string;
    description: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: number;
    category: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
    level: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url: string;
    githubUrl: string;
    startDate: string;
    endDate: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    credentialId: string;
    url: string;
  }>;
}

export default function EtudiantCVPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cvData, setCvData] = useState<CVData | null>(null);
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

    fetchCV();
  }, [session, status, router]);

  const fetchCV = async () => {
    try {
      const response = await fetch("/api/etudiant/cv");
      if (response.ok) {
        const data = await response.json();
        // Ensure all values are never null by providing defaults
        if (data.cv) {
          const cv = data.cv;
          setCvData({
            ...cv,
            personalInfo: {
              firstName: cv.personalInfo?.firstName || "",
              lastName: cv.personalInfo?.lastName || "",
              email: cv.personalInfo?.email || "",
              phone: cv.personalInfo?.phone || "",
              address: cv.personalInfo?.address || "",
              city: cv.personalInfo?.city || "",
              country: cv.personalInfo?.country || "",
              summary: cv.personalInfo?.summary || "",
              linkedIn: cv.personalInfo?.linkedIn || "",
              github: cv.personalInfo?.github || "",
              website: cv.personalInfo?.website || "",
            },
            education: cv.education?.map((edu: any) => ({
              ...edu,
              institution: edu.institution || "",
              degree: edu.degree || "",
              fieldOfStudy: edu.fieldOfStudy || "",
              startDate: edu.startDate || "",
              endDate: edu.endDate || "",
              grade: edu.grade || "",
              description: edu.description || "",
            })) || [],
            experience: cv.experience?.map((exp: any) => ({
              ...exp,
              company: exp.company || "",
              position: exp.position || "",
              location: exp.location || "",
              startDate: exp.startDate || "",
              endDate: exp.endDate || "",
              description: exp.description || "",
              achievements: exp.achievements || [],
            })) || [],
            skills: cv.skills?.map((skill: any) => ({
              ...skill,
              name: skill.name || "",
              category: skill.category || "",
              level: skill.level || 1,
            })) || [],
            languages: cv.languages?.map((lang: any) => ({
              ...lang,
              name: lang.name || "",
              level: lang.level || "",
            })) || [],
            projects: cv.projects?.map((project: any) => ({
              ...project,
              name: project.name || "",
              description: project.description || "",
              technologies: project.technologies || [],
              url: project.url || "",
              githubUrl: project.githubUrl || "",
              startDate: project.startDate || "",
              endDate: project.endDate || "",
            })) || [],
            certifications: cv.certifications?.map((cert: any) => ({
              ...cert,
              name: cert.name || "",
              issuer: cert.issuer || "",
              issueDate: cert.issueDate || "",
              expiryDate: cert.expiryDate || "",
              credentialId: cert.credentialId || "",
              url: cert.url || "",
            })) || [],
          });
        } else {
          setCvData(null);
        }
      }
    } catch (error) {
      console.error("Error fetching CV:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Présent";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg">Chargement du CV...</p>
        </div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Mon CV</h1>
            <p className="text-gray-600 mb-8">Vous n'avez pas encore créé de CV.</p>
            <Link 
              href="/etudiant/cv-edit"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Créer mon CV
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon CV</h1>
          <Link 
            href="/etudiant/cv-edit"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier
          </Link>
        </div>

        {/* CV Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Personal Info Section */}
          {cvData.personalInfo && (
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">
                  {cvData.personalInfo.firstName} {cvData.personalInfo.lastName}
                </h2>
                {cvData.personalInfo.summary && (
                  <p className="text-lg opacity-90 max-w-2xl mx-auto">
                    {cvData.personalInfo.summary}
                  </p>
                )}
                <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
                  {cvData.personalInfo.email && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {cvData.personalInfo.email}
                    </div>
                  )}
                  {cvData.personalInfo.phone && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {cvData.personalInfo.phone}
                    </div>
                  )}
                  {cvData.personalInfo.address && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {cvData.personalInfo.address}, {cvData.personalInfo.city}
                    </div>
                  )}
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {cvData.personalInfo.linkedIn && (
                    <a href={cvData.personalInfo.linkedIn} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                  {cvData.personalInfo.github && (
                    <a href={cvData.personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  )}
                  {cvData.personalInfo.website && (
                    <a href={cvData.personalInfo.website} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="p-8">
            {/* Education Section */}
            {cvData.education.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  Formation
                </h3>
                <div className="space-y-4">
                  {cvData.education.map((edu) => (
                    <div key={edu.id} className="border-l-4 border-red-600 pl-4">
                      <h4 className="font-semibold text-lg text-gray-900">{edu.degree}</h4>
                      <p className="text-gray-700">{edu.institution}</p>
                      <p className="text-gray-600 text-sm">{edu.fieldOfStudy}</p>
                      <p className="text-gray-500 text-sm">
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </p>
                      {edu.grade && <p className="text-gray-600 text-sm">Note: {edu.grade}</p>}
                      {edu.description && <p className="text-gray-600 mt-2">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Section */}
            {cvData.experience.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Expérience Professionnelle
                </h3>
                <div className="space-y-6">
                  {cvData.experience.map((exp) => (
                    <div key={exp.id} className="border-l-4 border-red-600 pl-4">
                      <h4 className="font-semibold text-lg text-gray-900">{exp.position}</h4>
                      <p className="text-red-600 font-medium">{exp.company}</p>
                      <p className="text-gray-600 text-sm">{exp.location}</p>
                      <p className="text-gray-500 text-sm">
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                      </p>
                      {exp.description && <p className="text-gray-600 mt-2">{exp.description}</p>}
                      {exp.achievements.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {exp.achievements.map((achievement, index) => (
                            <li key={index} className="text-gray-600 text-sm flex items-start">
                              <span className="text-red-600 mr-2">•</span>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {cvData.skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Compétences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cvData.skills.map((skill) => (
                    <div key={skill.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{skill.name}</span>
                        <span className="text-sm text-gray-500">{skill.category}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(skill.level / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Niveau {skill.level}/5</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Section */}
            {cvData.languages.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  Langues
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cvData.languages.map((lang) => (
                    <div key={lang.id} className="bg-gray-50 p-4 rounded-lg">
                      <span className="font-medium text-gray-900">{lang.name}</span>
                      <span className="ml-2 text-sm text-gray-500">({lang.level})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {cvData.projects.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Projets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cvData.projects.map((project) => (
                    <div key={project.id} className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">{project.name}</h4>
                      {project.description && <p className="text-gray-600 mb-3">{project.description}</p>}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.technologies.map((tech, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800 text-sm font-medium">
                            Voir le projet
                          </a>
                        )}
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800 text-sm font-medium">
                            Code source
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Section */}
            {cvData.certifications.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Certifications
                </h3>
                <div className="space-y-4">
                  {cvData.certifications.map((cert) => (
                    <div key={cert.id} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-lg text-gray-900">{cert.name}</h4>
                      <p className="text-gray-700">{cert.issuer}</p>
                      <p className="text-gray-500 text-sm">
                        {formatDate(cert.issueDate)} - {cert.expiryDate ? formatDate(cert.expiryDate) : "Pas d'expiration"}
                      </p>
                      {cert.credentialId && <p className="text-gray-600 text-sm">ID: {cert.credentialId}</p>}
                      {cert.url && (
                        <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Vérifier la certification
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
