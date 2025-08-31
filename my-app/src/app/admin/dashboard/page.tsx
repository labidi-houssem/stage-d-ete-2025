"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import AdminNotifications from "@/components/AdminNotifications";

interface Stats {
  totalUsers: number;
  admins: number;
  enseignants: number;
  candidats: number;
  etudiants: number;
  totalReservations: number;
  pendingReservations: number;
  completedReservations: number;
}

interface UnassignedCandidate {
  id: string;
  name?: string;
  email: string;
  createdAt: string;
}

interface EnseignantWithDisponibilites {
  id: string;
  name?: string;
  email: string;
  disponibilites: Array<{
    id: string;
    dateDebut: string;
    dateFin: string;
  }>;
}

function exportToCSV(data: any[], columns: string[], filename: string) {
  const csvRows = [columns.join(",")];
  for (const row of data) {
    csvRows.push(columns.map(col => '"' + (row[col] ?? "") + '"').join(","));
  }
  const csv = csvRows.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [unassignedCandidates, setUnassignedCandidates] = useState<UnassignedCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [enseignants, setEnseignants] = useState<EnseignantWithDisponibilites[]>([]);
  const [loadingEnseignants, setLoadingEnseignants] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [candidateToAssign, setCandidateToAssign] = useState<UnassignedCandidate | null>(null);
  const [selectedEnseignantId, setSelectedEnseignantId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [enseignantSearch, setEnseignantSearch] = useState("");
  const [assignedCandidateSearch, setAssignedCandidateSearch] = useState("");
  const [assignedCandidates, setAssignedCandidates] = useState<any[]>([]);
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [selectedCandidateCV, setSelectedCandidateCV] = useState<any>(null);
  const [cvLoading, setCvLoading] = useState(false);

  const filteredCandidates = unassignedCandidates.filter(c =>
    (c.name || "").toLowerCase().includes(candidateSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(candidateSearch.toLowerCase())
  );
  const filteredEnseignants = enseignants.filter(e =>
    (e.name || "").toLowerCase().includes(enseignantSearch.toLowerCase()) ||
    (e.email || "").toLowerCase().includes(enseignantSearch.toLowerCase())
  );
  const filteredAssignedCandidates = assignedCandidates.filter(c =>
    (c.name || "").toLowerCase().includes(assignedCandidateSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(assignedCandidateSearch.toLowerCase()) ||
    (c.enseignant?.name || "").toLowerCase().includes(assignedCandidateSearch.toLowerCase()) ||
    (c.enseignant?.email || "").toLowerCase().includes(assignedCandidateSearch.toLowerCase())
  );

  const fetchEnseignants = async () => {
    try {
      const res = await fetch("/api/admin/enseignants-availabilities");
      if (res.ok) {
        const data = await res.json();
        const availableEnseignants = (data.enseignants || []).filter((e: any) => e.disponibilites.length > 0);
        setEnseignants(availableEnseignants);
      }
    } catch (e) {
      setEnseignants([]);
    } finally {
      setLoadingEnseignants(false);
    }
  };

  const fetchAssignedCandidates = async () => {
    try {
      const res = await fetch("/api/admin/assigned-candidates");
      if (res.ok) {
        const data = await res.json();
        setAssignedCandidates(data.candidates || []);
      }
    } catch (e) {
      setAssignedCandidates([]);
    } finally {
      setLoadingAssigned(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/Auth/Signin");
      return;
    }
    
    if ((session.user as any)?.role !== "ADMIN") {
      router.push("/welcome");
      return;
    }

    fetchStats();
    fetchUnassignedCandidates();
    fetchEnseignants();
    fetchAssignedCandidates();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const [usersResponse, reservationsResponse] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/stats')
      ]);

      if (usersResponse.ok && reservationsResponse.ok) {
        const usersData = await usersResponse.json();
        const reservationsData = await reservationsResponse.json();
        
        const users = usersData.users || [];
        const stats: Stats = {
          totalUsers: users.length,
          admins: users.filter((u: any) => u.role === 'ADMIN').length,
          enseignants: users.filter((u: any) => u.role === 'ENSEIGNANT').length,
          candidats: users.filter((u: any) => u.role === 'CANDIDAT').length,
          etudiants: users.filter((u: any) => u.role === 'ETUDIANT').length,
          totalReservations: reservationsData.totalReservations || 0,
          pendingReservations: reservationsData.pendingReservations || 0,
          completedReservations: reservationsData.completedReservations || 0,
        };
        
        setStats(stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedCandidates = async () => {
    try {
      const res = await fetch("/api/admin/unassigned-candidates");
      if (res.ok) {
        const data = await res.json();
        setUnassignedCandidates(data.candidates || []);
      }
    } catch (e) {
      setUnassignedCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const openCVModal = async (candidateId: string) => {
    console.log("Opening CV modal for candidate:", candidateId);
    setCvLoading(true);
    setCvModalOpen(true);
    try {
      const url = `/api/admin/candidate-cv/${candidateId}`;
      console.log("Fetching CV from:", url);
      const response = await fetch(url);
      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("CV data received:", data);
        setSelectedCandidateCV(data.cv);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch CV:", response.status, errorData);
        setSelectedCandidateCV(null);
      }
    } catch (error) {
      console.error("Error fetching CV:", error);
      setSelectedCandidateCV(null);
    } finally {
      setCvLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-6 text-xl font-medium text-gray-700">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-3xl shadow-xl mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Tableau de Bord Administrateur
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Bienvenue, {session?.user?.name || session?.user?.email}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-700 mx-auto rounded-full"></div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Total Utilisateurs</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Total Réservations</p>
                  <p className="text-3xl font-bold text-green-900">{stats.totalReservations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-600">En Attente</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.pendingReservations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Terminées</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.completedReservations}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-red-200 rounded-xl">
                  <span className="text-3xl">👑</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-700">Admins</p>
                  <p className="text-3xl font-bold text-red-900">{stats.admins}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-blue-200 rounded-xl">
                  <span className="text-3xl">👨‍🏫</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Enseignants</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.enseignants}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-green-200 rounded-xl">
                  <span className="text-3xl">👤</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Candidats</p>
                  <p className="text-3xl font-bold text-green-900">{stats.candidats}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-200 rounded-xl">
                  <span className="text-3xl">🎓</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-700">Étudiants</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.etudiants}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="mb-12">
          <AdminNotifications />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">CVs des Candidats</h3>
                <p className="text-sm text-gray-600">Consulter tous les CVs</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/admin/candidates-cv")}
              className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium"
            >
              Voir les CVs
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Gestion Utilisateurs</h3>
                <p className="text-sm text-gray-600">Gérer les comptes</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/admin/users")}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
            >
              Gérer les utilisateurs
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Créer Utilisateurs</h3>
                <p className="text-sm text-gray-600">Ajouter des comptes</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/admin/create-users")}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium"
            >
              Créer des utilisateurs
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Statistiques</h3>
                <p className="text-sm text-gray-600">Voir les rapports</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/admin/statistics")}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium"
            >
              Voir les statistiques
            </button>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-12">
          {/* Unassigned Candidates Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Candidats en attente d'assignation
              </h2>
            </div>
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={candidateSearch}
                    onChange={e => setCandidateSearch(e.target.value)}
                    placeholder="Rechercher par nom ou email..."
                    className="w-full md:w-80 pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200"
                    aria-label="Rechercher un candidat"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={() => {
                    const exportData = filteredCandidates.map(c => ({
                      name: c.name || "",
                      email: c.email,
                      createdAt: new Date(c.createdAt).toLocaleDateString("fr-FR")
                    }));
                    exportToCSV(exportData, ["name", "email", "createdAt"], "candidats.csv");
                  }}
                >
                  📊 Exporter CSV
                </button>
              </div>
              
              {loadingCandidates ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
                  <p className="mt-4 text-gray-600">Chargement des candidats...</p>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">Aucun candidat en attente d'assignation</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Nom</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Date d'inscription</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCandidates.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">{c.name || <span className="italic text-gray-400">(Non renseigné)</span>}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{c.email}</td>
                          <td className="px-6 py-4 text-gray-600">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openCVModal(c.id)}
                                className="px-3 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg hover:from-rose-700 hover:to-pink-700 focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                                title="Voir le CV du candidat"
                              >
                                👁️ CV
                              </button>
                              <button
                                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                                onClick={() => {
                                  setCandidateToAssign(c);
                                  setAssignModalOpen(true);
                                  setSelectedEnseignantId("");
                                }}
                              >
                                📝 Demander entretien
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Continue with other sections... */}
          
          {/* Assigned Candidates Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Candidats assignés
              </h2>
            </div>
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={assignedCandidateSearch}
                    onChange={e => setAssignedCandidateSearch(e.target.value)}
                    placeholder="Rechercher par nom, email ou enseignant..."
                    className="w-full md:w-80 pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all duration-200"
                    aria-label="Rechercher un candidat assigné"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={() => {
                    const exportData = filteredAssignedCandidates.map(c => ({
                      name: c.name || "",
                      email: c.email,
                      enseignantName: c.enseignant?.name || "",
                      enseignantEmail: c.enseignant?.email || "",
                      status: c.status,
                      createdAt: new Date(c.createdAt).toLocaleDateString("fr-FR")
                    }));
                    exportToCSV(exportData, ["name", "email", "enseignantName", "enseignantEmail", "status", "createdAt"], "candidats_assignes.csv");
                  }}
                >
                  📊 Exporter CSV
                </button>
              </div>
              
              {loadingAssigned ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
                  <p className="mt-4 text-gray-600">Chargement des candidats assignés...</p>
                </div>
              ) : filteredAssignedCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">Aucun candidat assigné</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Nom</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Enseignant assigné</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Statut</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Date d'entretien</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Date d'assignation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredAssignedCandidates.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{c.name || <span className="italic text-gray-400">(Non renseigné)</span>}</span>
                              {c.specialite && <span className="text-xs text-gray-500">{c.specialite}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{c.email}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{c.enseignant?.name || <span className="italic text-gray-400">(Non renseigné)</span>}</span>
                              <span className="text-xs text-gray-500">{c.enseignant?.email}</span>
                              {c.enseignant?.specialite && <span className="text-xs text-gray-400">{c.enseignant.specialite}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              c.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              c.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                              c.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {c.status === 'PENDING' ? 'En attente' :
                               c.status === 'ACCEPTED' ? 'Accepté' :
                               c.status === 'REJECTED' ? 'Refusé' :
                               c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {c.dateEntretien ? (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">{new Date(c.dateEntretien).toLocaleDateString("fr-FR")}</span>
                                <span className="text-xs text-gray-500">{new Date(c.dateEntretien).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                                {c.meetLink && (
                                  <a 
                                    href={c.meetLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                  >
                                    🔗 Lien de réunion
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">Non confirmé</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{new Date(c.requestCreatedAt).toLocaleDateString("fr-FR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Enseignants Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Enseignants disponibles pour assignation
              </h2>
            </div>
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={enseignantSearch}
                    onChange={e => setEnseignantSearch(e.target.value)}
                    placeholder="Rechercher par nom ou email..."
                    className="w-full md:w-80 pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                    aria-label="Rechercher un enseignant"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={() => exportToCSV(filteredEnseignants, ["name", "email"], "enseignants.csv")}
                >
                  📊 Exporter CSV
                </button>
              </div>
              
              {loadingEnseignants ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-4 text-gray-600">Chargement des enseignants...</p>
                </div>
              ) : filteredEnseignants.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">Aucun enseignant avec des créneaux disponibles</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Nom</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Créneaux disponibles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredEnseignants.map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">{e.name || <span className="italic text-gray-400">(Non renseigné)</span>}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{e.email}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                📅 {e.disponibilites.length} créneau{e.disponibilites.length !== 1 ? 'x' : ''} disponible{e.disponibilites.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assignment Modal */}
        {assignModalOpen && candidateToAssign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="assign-modal-title">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 m-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 id="assign-modal-title" className="text-2xl font-bold text-gray-900">Demander un entretien</h2>
              </div>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="mb-2 font-semibold text-gray-700">Candidat :</div>
                <div className="text-gray-800">
                  <div className="font-medium">{candidateToAssign.name || <span className="italic text-gray-400">(Non renseigné)</span>}</div>
                  <div className="text-sm text-gray-600">{candidateToAssign.email}</div>
                </div>
              </div>
              
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  setAssigning(true);
                  setAssignError("");
                  setAssignSuccess("");
                  try {
                    const res = await fetch("/api/admin/request-interview", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ 
                        candidateId: candidateToAssign?.id, 
                        enseignantId: selectedEnseignantId 
                      }),
                    });
                    if (res.ok) {
                      setAssignSuccess("Demande d'entretien envoyée à l'enseignant !");
                      setAssignModalOpen(false);
                      setCandidateToAssign(null);
                      setSelectedEnseignantId("");
                      fetchUnassignedCandidates();
                      fetchEnseignants();
                      fetchAssignedCandidates();
                    } else {
                      const error = await res.json();
                      setAssignError(error.error || "Erreur lors de l'envoi de la demande.");
                    }
                  } catch (e) {
                    setAssignError("Erreur lors de l'envoi de la demande.");
                  } finally {
                    setAssigning(false);
                  }
                }}
                className="space-y-6"
              >
                <label className="block" htmlFor="enseignant-select">
                  <span className="block text-sm font-medium text-gray-700 mb-2">Enseignant :</span>
                  <select
                    id="enseignant-select"
                    required
                    value={selectedEnseignantId}
                    onChange={e => setSelectedEnseignantId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200"
                  >
                    <option value="">Choisir un enseignant</option>
                    {enseignants.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name || e.email} ({e.disponibilites.length} créneau{e.disponibilites.length !== 1 ? 'x' : ''} disponible{e.disponibilites.length !== 1 ? 's' : ''})
                      </option>
                    ))}
                  </select>
                </label>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                  <p><strong>💡 Note :</strong> L'enseignant recevra une notification et choisira lui-même la date/heure de l'entretien.</p>
                </div>
                
                {assignError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
                    ❌ {assignError}
                  </div>
                )}
                
                {assignSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                    ✅ {assignSuccess}
                  </div>
                )}
                
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setAssignModalOpen(false); setCandidateToAssign(null); setAssignError(""); setAssignSuccess(""); }}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all duration-200 font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedEnseignantId || assigning}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-red-500 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {assigning ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Envoi...
                      </span>
                    ) : (
                      "📤 Envoyer la demande"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CV Modal */}
        {cvModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-100">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-600 to-rose-600">
                <h3 className="text-xl font-bold text-white">CV du Candidat - Vue Administrateur</h3>
                <button
                  onClick={() => {
                    setCvModalOpen(false);
                    setSelectedCandidateCV(null);
                  }}
                  className="p-2 text-white hover:text-gray-200 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {cvLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
                      <p className="mt-4 text-gray-600">Chargement du CV...</p>
                    </div>
                  </div>
                ) : selectedCandidateCV ? (
                  <div className="space-y-6">
                    {/* Admin Notice */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.414-1.414l-4 4L9 19.414l-4-4 4-4z" />
                        </svg>
                        <span className="text-red-800 font-medium">Vue Administrateur - Évaluation avant assignation</span>
                      </div>
                    </div>

                    {/* Personal Info */}
                    {selectedCandidateCV.personalInfo && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Informations personnelles
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-xl font-bold text-gray-900 mb-2">
                            {selectedCandidateCV.personalInfo.firstName} {selectedCandidateCV.personalInfo.lastName}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            {selectedCandidateCV.personalInfo.email && (
                              <p>📧 {selectedCandidateCV.personalInfo.email}</p>
                            )}
                            {selectedCandidateCV.personalInfo.phone && (
                              <p>📱 {selectedCandidateCV.personalInfo.phone}</p>
                            )}
                            {selectedCandidateCV.personalInfo.address && (
                              <p>📍 {selectedCandidateCV.personalInfo.address}</p>
                            )}
                          </div>
                          {selectedCandidateCV.personalInfo.summary && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Résumé professionnel:</p>
                              <p className="text-gray-700">{selectedCandidateCV.personalInfo.summary}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {selectedCandidateCV.education && selectedCandidateCV.education.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          </svg>
                          Formation ({selectedCandidateCV.education.length})
                        </h4>
                        <div className="space-y-3">
                          {selectedCandidateCV.education.map((edu: any) => (
                            <div key={edu.id} className="bg-gray-50 rounded-lg p-4">
                              <h5 className="font-semibold text-gray-900">{edu.degree}</h5>
                              <p className="text-red-600 font-medium">{edu.institution}</p>
                              {edu.fieldOfStudy && <p className="text-gray-600">{edu.fieldOfStudy}</p>}
                              <p className="text-sm text-gray-500">
                                {new Date(edu.startDate).getFullYear()} - {edu.current ? "En cours" : new Date(edu.endDate).getFullYear()}
                              </p>
                              {edu.grade && <p className="text-sm text-gray-600">Note: {edu.grade}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {selectedCandidateCV.experience && selectedCandidateCV.experience.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
                          </svg>
                          Expérience professionnelle ({selectedCandidateCV.experience.length})
                        </h4>
                        <div className="space-y-3">
                          {selectedCandidateCV.experience.map((exp: any) => (
                            <div key={exp.id} className="bg-gray-50 rounded-lg p-4">
                              <h5 className="font-semibold text-gray-900">{exp.position}</h5>
                              <p className="text-red-600 font-medium">{exp.company}</p>
                              {exp.location && <p className="text-gray-600">{exp.location}</p>}
                              <p className="text-sm text-gray-500">
                                {new Date(exp.startDate).getFullYear()} - {exp.current ? "En cours" : new Date(exp.endDate).getFullYear()}
                              </p>
                              {exp.description && <p className="text-gray-700 mt-2">{exp.description}</p>}
                              {exp.achievements && exp.achievements.length > 0 && (
                                <ul className="list-disc list-inside mt-2 text-gray-700 text-sm">
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

                    {/* Skills */}
                    {selectedCandidateCV.skills && selectedCandidateCV.skills.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Compétences ({selectedCandidateCV.skills.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCandidateCV.skills.map((skill: any) => (
                            <span key={skill.id} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                              {skill.name} ({skill.level}/5)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {selectedCandidateCV.languages && selectedCandidateCV.languages.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                          Langues ({selectedCandidateCV.languages.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCandidateCV.languages.map((lang: any) => (
                            <span key={lang.id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              {lang.name} - {lang.level}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {selectedCandidateCV.projects && selectedCandidateCV.projects.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          Projets ({selectedCandidateCV.projects.length})
                        </h4>
                        <div className="space-y-3">
                          {selectedCandidateCV.projects.map((project: any) => (
                            <div key={project.id} className="bg-gray-50 rounded-lg p-4">
                              <h5 className="font-semibold text-gray-900">{project.name}</h5>
                              {project.description && <p className="text-gray-700 mt-1">{project.description}</p>}
                              {project.technologies && project.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {project.technologies.map((tech: string, index: number) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
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

                    {/* Certifications */}
                    {selectedCandidateCV.certifications && selectedCandidateCV.certifications.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          Certifications ({selectedCandidateCV.certifications.length})
                        </h4>
                        <div className="space-y-3">
                          {selectedCandidateCV.certifications.map((cert: any) => (
                            <div key={cert.id} className="bg-gray-50 rounded-lg p-4">
                              <h5 className="font-semibold text-gray-900">{cert.name}</h5>
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
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun CV disponible</h3>
                    <p className="text-gray-600">Ce candidat n'a pas encore créé de CV.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">💡 Conseil:</span> Évaluez le profil avant d'assigner à un enseignant
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setCvModalOpen(false);
                      setSelectedCandidateCV(null);
                    }}
                    className="px-6 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                  {selectedCandidateCV && (
                    <button
                      onClick={() => {
                        setCvModalOpen(false);
                        const candidateId = selectedCandidateCV.candidatId;
                        router.push(`/admin/candidate-cv/${candidateId}`);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-colors"
                    >
                      Voir en pleine page
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}