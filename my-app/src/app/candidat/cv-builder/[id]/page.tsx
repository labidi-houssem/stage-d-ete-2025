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

export default function CVBuilder() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const cvId = params.id as string;
  
  const [cv, setCv] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("personal");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "CANDIDAT") {
      router.push("/Auth/Signin");
      return;
    }
    fetchCV();
  }, [session, status, router, cvId]);

  const fetchCV = async () => {
    try {
      const response = await fetch(`/api/candidat/cv/${cvId}`);
      if (response.ok) {
        const data = await response.json();
        setCv(data.cv);
      } else {
        router.push("/candidat/dashboard");
      }
    } catch (error) {
      console.error("Error fetching CV:", error);
      router.push("/candidat/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: "personal", name: "Informations personnelles", icon: "👤" },
    { id: "education", name: "Formation", icon: "🎓" },
    { id: "experience", name: "Expérience", icon: "💼" },
    { id: "skills", name: "Compétences", icon: "⚡" },
    { id: "languages", name: "Langues", icon: "🌍" },
    { id: "projects", name: "Projets", icon: "🚀" },
    { id: "certifications", name: "Certifications", icon: "🏆" }
  ];

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

  if (!cv) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">CV non trouvé</h1>
          <button
            onClick={() => router.push("/candidat/dashboard")}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white/70 backdrop-blur-sm border-r border-white/20 min-h-screen">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => router.push("/candidat/dashboard")}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Éditeur de CV</h1>
                <p className="text-sm text-gray-600">{cv.title}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeSection === section.id
                      ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-medium">{section.name}</span>
                </button>
              ))}
            </nav>

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => router.push(`/candidat/cv-preview/${cv.id}`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Aperçu du CV
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Section Content */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              {activeSection === "personal" && (
                <PersonalInfoSection cv={cv} setCv={setCv} />
              )}
              {activeSection === "education" && (
                <EducationSection cv={cv} setCv={setCv} />
              )}
              {activeSection === "experience" && (
                <ExperienceSection cv={cv} setCv={setCv} />
              )}
              {activeSection === "skills" && (
                <SkillsSection cv={cv} setCv={setCv} />
              )}
              {activeSection === "languages" && (
                <LanguagesSection cv={cv} setCv={setCv} />
              )}
              {activeSection === "projects" && (
                <ProjectsSection cv={cv} setCv={setCv} />
              )}
              {activeSection === "certifications" && (
                <CertificationsSection cv={cv} setCv={setCv} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Personal Info Section Component
function PersonalInfoSection({ cv, setCv }: { cv: CVData; setCv: (cv: CVData) => void }) {
  const [formData, setFormData] = useState({
    firstName: cv.personalInfo?.firstName || "",
    lastName: cv.personalInfo?.lastName || "",
    email: cv.personalInfo?.email || "",
    phone: cv.personalInfo?.phone || "",
    address: cv.personalInfo?.address || "",
    city: cv.personalInfo?.city || "",
    summary: cv.personalInfo?.summary || "",
    linkedIn: cv.personalInfo?.linkedIn || "",
    website: cv.personalInfo?.website || ""
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/candidat/cv/${cv.id}/personal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const data = await response.json();
        setCv({ ...cv, personalInfo: data.personalInfo });
      }
    } catch (error) {
      console.error("Error saving personal info:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Informations personnelles</h2>
          <p className="text-gray-600">Renseignez vos informations de base</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 disabled:opacity-50 transition-all duration-200 font-medium"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Prénom *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
            placeholder="Votre prénom"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nom *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
            placeholder="Votre nom"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
            placeholder="votre.email@exemple.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
            placeholder="+33 1 23 45 67 89"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Adresse
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
            placeholder="123 Rue de la Paix"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ville
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
            placeholder="Paris, France"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            LinkedIn
          </label>
          <input
            type="url"
            value={formData.linkedIn}
            onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
            placeholder="https://linkedin.com/in/votre-profil"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Site web
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
            placeholder="https://votre-site.com"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Résumé professionnel
        </label>
        <textarea
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 resize-none"
          placeholder="Décrivez brièvement votre profil professionnel, vos objectifs et vos principales compétences..."
        />
      </div>
    </div>
  );
}

// Education Section Component
function EducationSection({ cv, setCv }: { cv: CVData; setCv: (cv: CVData) => void }) {
  const [educations, setEducations] = useState(cv.education || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    current: false,
    grade: "",
    description: ""
  });

  const resetForm = () => {
    setFormData({
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      current: false,
      grade: "",
      description: ""
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    try {
      const url = editingId
        ? `/api/candidat/cv/${cv.id}/education/${editingId}`
        : `/api/candidat/cv/${cv.id}/education`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (editingId) {
          setEducations(educations.map(edu => edu.id === editingId ? data.education : edu));
        } else {
          setEducations([...educations, data.education]);
        }
        setCv({ ...cv, education: editingId ? educations.map(edu => edu.id === editingId ? data.education : edu) : [...educations, data.education] });
        resetForm();
      }
    } catch (error) {
      console.error("Error saving education:", error);
    }
  };

  const handleEdit = (education: any) => {
    setFormData({
      institution: education.institution || "",
      degree: education.degree || "",
      fieldOfStudy: education.fieldOfStudy || "",
      startDate: education.startDate ? education.startDate.split('T')[0] : "",
      endDate: education.endDate ? education.endDate.split('T')[0] : "",
      current: education.current || false,
      grade: education.grade || "",
      description: education.description || ""
    });
    setEditingId(education.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/candidat/cv/${cv.id}/education/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        const newEducations = educations.filter(edu => edu.id !== id);
        setEducations(newEducations);
        setCv({ ...cv, education: newEducations });
      }
    } catch (error) {
      console.error("Error deleting education:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Formation</h2>
          <p className="text-gray-600">Ajoutez vos diplômes et formations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium"
        >
          + Ajouter une formation
        </button>
      </div>

      {/* Education List */}
      <div className="space-y-4 mb-8">
        {educations.map((education) => (
          <div key={education.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{education.degree}</h3>
                <p className="text-red-600 font-medium">{education.institution}</p>
                <p className="text-gray-600">{education.fieldOfStudy}</p>
                <p className="text-sm text-gray-500">
                  {new Date(education.startDate).getFullYear()} - {education.current ? "En cours" : new Date(education.endDate).getFullYear()}
                </p>
                {education.grade && <p className="text-sm text-gray-600">Note: {education.grade}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(education)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(education.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {editingId ? "Modifier la formation" : "Ajouter une formation"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Institution *
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                placeholder="Université, École..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Diplôme *
              </label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                placeholder="Master, Licence, Bac..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Domaine d'étude
              </label>
              <input
                type="text"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                placeholder="Informatique, Gestion..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Note/Mention
              </label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                placeholder="Très bien, 16/20..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={formData.current}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.current}
                onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">Formation en cours</span>
            </label>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 resize-none"
              placeholder="Décrivez votre formation, les matières principales..."
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium"
            >
              {editingId ? "Modifier" : "Ajouter"}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Experience Section Component
function ExperienceSection({ cv, setCv }: { cv: CVData; setCv: (cv: CVData) => void }) {
  const [experiences, setExperiences] = useState(cv.experience || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    achievements: [""]
  });

  const resetForm = () => {
    setFormData({
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      achievements: [""]
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    try {
      const url = editingId
        ? `/api/candidat/cv/${cv.id}/experience/${editingId}`
        : `/api/candidat/cv/${cv.id}/experience`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          achievements: formData.achievements.filter(a => a.trim() !== "")
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (editingId) {
          setExperiences(experiences.map(exp => exp.id === editingId ? data.experience : exp));
        } else {
          setExperiences([...experiences, data.experience]);
        }
        setCv({ ...cv, experience: editingId ? experiences.map(exp => exp.id === editingId ? data.experience : exp) : [...experiences, data.experience] });
        resetForm();
      }
    } catch (error) {
      console.error("Error saving experience:", error);
    }
  };

  const handleEdit = (experience: any) => {
    setFormData({
      company: experience.company || "",
      position: experience.position || "",
      location: experience.location || "",
      startDate: experience.startDate ? experience.startDate.split('T')[0] : "",
      endDate: experience.endDate ? experience.endDate.split('T')[0] : "",
      current: experience.current || false,
      description: experience.description || "",
      achievements: experience.achievements?.length > 0 ? experience.achievements : [""]
    });
    setEditingId(experience.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/candidat/cv/${cv.id}/experience/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        const newExperiences = experiences.filter(exp => exp.id !== id);
        setExperiences(newExperiences);
        setCv({ ...cv, experience: newExperiences });
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
    }
  };

  const addAchievement = () => {
    setFormData({
      ...formData,
      achievements: [...formData.achievements, ""]
    });
  };

  const updateAchievement = (index: number, value: string) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index] = value;
    setFormData({ ...formData, achievements: newAchievements });
  };

  const removeAchievement = (index: number) => {
    const newAchievements = formData.achievements.filter((_, i) => i !== index);
    setFormData({ ...formData, achievements: newAchievements });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expérience professionnelle</h2>
          <p className="text-gray-600">Ajoutez vos expériences de travail</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium"
        >
          + Ajouter une expérience
        </button>
      </div>

      {/* Experience List */}
      <div className="space-y-4 mb-8">
        {experiences.map((experience) => (
          <div key={experience.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{experience.position}</h3>
                <p className="text-red-600 font-medium">{experience.company}</p>
                <p className="text-gray-600">{experience.location}</p>
                <p className="text-sm text-gray-500">
                  {new Date(experience.startDate).getFullYear()} - {experience.current ? "En cours" : new Date(experience.endDate).getFullYear()}
                </p>
                {experience.description && (
                  <p className="text-sm text-gray-600 mt-2">{experience.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(experience)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(experience.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {editingId ? "Modifier l'expérience" : "Ajouter une expérience"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Entreprise *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                placeholder="Nom de l'entreprise"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Poste *
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                placeholder="Titre du poste"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lieu
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                placeholder="Ville, Pays"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={formData.current}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.current}
                onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">Poste actuel</span>
            </label>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 resize-none"
              placeholder="Décrivez vos responsabilités et missions..."
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Réalisations
            </label>
            {formData.achievements.map((achievement, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => updateAchievement(index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                  placeholder="Décrivez une réalisation..."
                />
                {formData.achievements.length > 1 && (
                  <button
                    onClick={() => removeAchievement(index)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addAchievement}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              + Ajouter une réalisation
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium"
            >
              {editingId ? "Modifier" : "Ajouter"}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Skills Section Component
function SkillsSection({ cv, setCv }: { cv: CVData; setCv: (cv: CVData) => void }) {
  const [skills, setSkills] = useState(cv.skills || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    level: 3,
    category: "Technical"
  });

  const skillCategories = ["Technical", "Language", "Soft Skills", "Tools", "Other"];
  const skillLevels = [
    { value: 1, label: "Débutant" },
    { value: 2, label: "Intermédiaire" },
    { value: 3, label: "Avancé" },
    { value: 4, label: "Expert" },
    { value: 5, label: "Maître" }
  ];

  const resetForm = () => {
    setFormData({
      name: "",
      level: 3,
      category: "Technical"
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    try {
      const url = editingId
        ? `/api/candidat/cv/${cv.id}/skills/${editingId}`
        : `/api/candidat/cv/${cv.id}/skills`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (editingId) {
          setSkills(skills.map(skill => skill.id === editingId ? data.skill : skill));
        } else {
          setSkills([...skills, data.skill]);
        }
        setCv({ ...cv, skills: editingId ? skills.map(skill => skill.id === editingId ? data.skill : skill) : [...skills, data.skill] });
        resetForm();
      }
    } catch (error) {
      console.error("Error saving skill:", error);
    }
  };

  const handleEdit = (skill: any) => {
    setFormData({
      name: skill.name || "",
      level: skill.level || 3,
      category: skill.category || "Technical"
    });
    setEditingId(skill.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/candidat/cv/${cv.id}/skills/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        const newSkills = skills.filter(skill => skill.id !== id);
        setSkills(newSkills);
        setCv({ ...cv, skills: newSkills });
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
  };

  const getSkillLevelColor = (level: number) => {
    switch (level) {
      case 1: return "bg-red-200 text-red-800";
      case 2: return "bg-yellow-200 text-yellow-800";
      case 3: return "bg-blue-200 text-blue-800";
      case 4: return "bg-green-200 text-green-800";
      case 5: return "bg-purple-200 text-purple-800";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const groupedSkills = skills.reduce((acc: any, skill: any) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compétences</h2>
          <p className="text-gray-600">Ajoutez vos compétences techniques et personnelles</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium"
        >
          + Ajouter une compétence
        </button>
      </div>

      {/* Skills by Category */}
      <div className="space-y-6 mb-8">
        {Object.entries(groupedSkills).map(([category, categorySkills]: [string, any]) => (
          <div key={category} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorySkills.map((skill: any) => (
                <div key={skill.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{skill.name}</h4>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(skill)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                      {skillLevels.find(l => l.value === skill.level)?.label}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(skill.level / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {editingId ? "Modifier la compétence" : "Ajouter une compétence"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom de la compétence *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                placeholder="JavaScript, Leadership..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
              >
                {skillCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Niveau de maîtrise
            </label>
            <div className="space-y-2">
              {skillLevels.map(level => (
                <label key={level.value} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="level"
                    value={level.value}
                    checked={formData.level === level.value}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">{level.label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${(level.value / 5) * 100}%` }}
                    ></div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium"
            >
              {editingId ? "Modifier" : "Ajouter"}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Languages Section Component
function LanguagesSection({ cv, setCv }: { cv: CVData; setCv: (cv: CVData) => void }) {
  const [languages, setLanguages] = useState(cv.languages || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    level: "Intermediate"
  });

  const languageLevels = ["Beginner", "Intermediate", "Advanced", "Native"];

  const resetForm = () => {
    setFormData({ name: "", level: "Intermediate" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    try {
      const url = editingId
        ? `/api/candidat/cv/${cv.id}/languages/${editingId}`
        : `/api/candidat/cv/${cv.id}/languages`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (editingId) {
          setLanguages(languages.map(lang => lang.id === editingId ? data.language : lang));
        } else {
          setLanguages([...languages, data.language]);
        }
        setCv({ ...cv, languages: editingId ? languages.map(lang => lang.id === editingId ? data.language : lang) : [...languages, data.language] });
        resetForm();
      }
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const handleEdit = (language: any) => {
    setFormData({
      name: language.name || "",
      level: language.level || "Intermediate"
    });
    setEditingId(language.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/candidat/cv/${cv.id}/languages/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        const newLanguages = languages.filter(lang => lang.id !== id);
        setLanguages(newLanguages);
        setCv({ ...cv, languages: newLanguages });
      }
    } catch (error) {
      console.error("Error deleting language:", error);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-red-100 text-red-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-green-100 text-green-800";
      case "Native": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Langues</h2>
          <p className="text-gray-600">Ajoutez les langues que vous maîtrisez</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium"
        >
          + Ajouter une langue
        </button>
      </div>

      {/* Languages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {languages.map((language) => (
          <div key={language.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{language.name}</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(language)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(language.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(language.level)}`}>
              {language.level}
            </span>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {editingId ? "Modifier la langue" : "Ajouter une langue"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Langue *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                placeholder="Français, Anglais, Espagnol..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Niveau
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
              >
                {languageLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium"
            >
              {editingId ? "Modifier" : "Ajouter"}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Projects Section Component
function ProjectsSection({ cv, setCv }: { cv: CVData; setCv: (cv: CVData) => void }) {
  const [projects, setProjects] = useState(cv.projects || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    technologies: [""],
    url: "",
    githubUrl: "",
    startDate: "",
    endDate: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      technologies: [""],
      url: "",
      githubUrl: "",
      startDate: "",
      endDate: ""
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    try {
      const url = editingId
        ? `/api/candidat/cv/${cv.id}/projects/${editingId}`
        : `/api/candidat/cv/${cv.id}/projects`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          technologies: formData.technologies.filter(t => t.trim() !== "")
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (editingId) {
          setProjects(projects.map(proj => proj.id === editingId ? data.project : proj));
        } else {
          setProjects([...projects, data.project]);
        }
        setCv({ ...cv, projects: editingId ? projects.map(proj => proj.id === editingId ? data.project : proj) : [...projects, data.project] });
        resetForm();
      }
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const addTechnology = () => {
    setFormData({
      ...formData,
      technologies: [...formData.technologies, ""]
    });
  };

  const updateTechnology = (index: number, value: string) => {
    const newTechnologies = [...formData.technologies];
    newTechnologies[index] = value;
    setFormData({ ...formData, technologies: newTechnologies });
  };

  const removeTechnology = (index: number) => {
    const newTechnologies = formData.technologies.filter((_, i) => i !== index);
    setFormData({ ...formData, technologies: newTechnologies });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projets</h2>
          <p className="text-gray-600">Présentez vos projets personnels et professionnels</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium"
        >
          + Ajouter un projet
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-6 mb-8">
        {projects.map((project) => (
          <div key={project.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                <p className="text-gray-600 mt-2">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.technologies.map((tech: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-4 mt-3">
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm">
                      🔗 Voir le projet
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-700 text-sm">
                      📁 Code source
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormData({
                      name: project.name || "",
                      description: project.description || "",
                      technologies: project.technologies?.length > 0 ? project.technologies : [""],
                      url: project.url || "",
                      githubUrl: project.githubUrl || "",
                      startDate: project.startDate ? project.startDate.split('T')[0] : "",
                      endDate: project.endDate ? project.endDate.split('T')[0] : ""
                    });
                    setEditingId(project.id);
                    setShowForm(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/candidat/cv/${cv.id}/projects/${project.id}`, {
                        method: "DELETE"
                      });
                      if (response.ok) {
                        const newProjects = projects.filter(proj => proj.id !== project.id);
                        setProjects(newProjects);
                        setCv({ ...cv, projects: newProjects });
                      }
                    } catch (error) {
                      console.error("Error deleting project:", error);
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {editingId ? "Modifier le projet" : "Ajouter un projet"}
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom du projet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                placeholder="Nom de votre projet"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 resize-none"
                placeholder="Décrivez votre projet..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Technologies utilisées
              </label>
              {formData.technologies.map((tech, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tech}
                    onChange={(e) => updateTechnology(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                    placeholder="React, Node.js, Python..."
                  />
                  {formData.technologies.length > 1 && (
                    <button
                      onClick={() => removeTechnology(index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addTechnology}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                + Ajouter une technologie
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL du projet
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                  placeholder="https://monprojet.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL GitHub
                </label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                  placeholder="https://github.com/user/repo"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium"
            >
              {editingId ? "Modifier" : "Ajouter"}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Certifications Section Component
function CertificationsSection({ cv, setCv }: { cv: CVData; setCv: (cv: CVData) => void }) {
  const [certifications, setCertifications] = useState(cv.certifications || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    url: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      url: ""
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    try {
      const url = editingId
        ? `/api/candidat/cv/${cv.id}/certifications/${editingId}`
        : `/api/candidat/cv/${cv.id}/certifications`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (editingId) {
          setCertifications(certifications.map(cert => cert.id === editingId ? data.certification : cert));
        } else {
          setCertifications([...certifications, data.certification]);
        }
        setCv({ ...cv, certifications: editingId ? certifications.map(cert => cert.id === editingId ? data.certification : cert) : [...certifications, data.certification] });
        resetForm();
      }
    } catch (error) {
      console.error("Error saving certification:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Certifications</h2>
          <p className="text-gray-600">Ajoutez vos certifications et diplômes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium"
        >
          + Ajouter une certification
        </button>
      </div>

      {/* Certifications List */}
      <div className="space-y-4 mb-8">
        {certifications.map((certification) => (
          <div key={certification.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{certification.name}</h3>
                <p className="text-red-600 font-medium">{certification.issuer}</p>
                <p className="text-sm text-gray-500">
                  Obtenu le {new Date(certification.issueDate).toLocaleDateString('fr-FR')}
                  {certification.expiryDate && ` • Expire le ${new Date(certification.expiryDate).toLocaleDateString('fr-FR')}`}
                </p>
                {certification.credentialId && (
                  <p className="text-sm text-gray-600">ID: {certification.credentialId}</p>
                )}
                {certification.url && (
                  <a href={certification.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm">
                    🔗 Voir la certification
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormData({
                      name: certification.name || "",
                      issuer: certification.issuer || "",
                      issueDate: certification.issueDate ? certification.issueDate.split('T')[0] : "",
                      expiryDate: certification.expiryDate ? certification.expiryDate.split('T')[0] : "",
                      credentialId: certification.credentialId || "",
                      url: certification.url || ""
                    });
                    setEditingId(certification.id);
                    setShowForm(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/candidat/cv/${cv.id}/certifications/${certification.id}`, {
                        method: "DELETE"
                      });
                      if (response.ok) {
                        const newCertifications = certifications.filter(cert => cert.id !== certification.id);
                        setCertifications(newCertifications);
                        setCv({ ...cv, certifications: newCertifications });
                      }
                    } catch (error) {
                      console.error("Error deleting certification:", error);
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {editingId ? "Modifier la certification" : "Ajouter une certification"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom de la certification *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                placeholder="AWS Certified Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Organisme émetteur *
              </label>
              <input
                type="text"
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                placeholder="Amazon Web Services"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date d'obtention
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date d'expiration
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ID de certification
              </label>
              <input
                type="text"
                value={formData.credentialId}
                onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                placeholder="ABC123456"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL de vérification
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                placeholder="https://verify.certification.com"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium"
            >
              {editingId ? "Modifier" : "Ajouter"}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
