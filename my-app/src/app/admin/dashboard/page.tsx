"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
        // Only show enseignants who have available slots
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de Bord Administrateur
        </h1>
        <p className="text-gray-600">
          Bienvenue, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Total Réservations</p>
                <p className="text-2xl font-bold text-green-900">{stats.totalReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">En Attente</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pendingReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Terminées</p>
                <p className="text-2xl font-bold text-purple-900">{stats.completedReservations}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">👑</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Admins</p>
                <p className="text-2xl font-bold text-red-900">{stats.admins}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Enseignants</p>
                <p className="text-2xl font-bold text-blue-900">{stats.enseignants}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">👤</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Candidats</p>
                <p className="text-2xl font-bold text-green-900">{stats.candidats}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">🎓</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Étudiants</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.etudiants}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unassigned Candidates Section */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Candidats en attente d'assignation</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
          <input
            type="text"
            value={candidateSearch}
            onChange={e => setCandidateSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="border p-2 rounded w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            aria-label="Rechercher un candidat"
          />
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs mt-2 md:mt-0 focus:ring-2 focus:ring-green-500 focus:outline-none"
            onClick={() => {
              const exportData = filteredCandidates.map(c => ({
                name: c.name || "",
                email: c.email,
                createdAt: new Date(c.createdAt).toLocaleDateString("fr-FR")
              }));
              exportToCSV(exportData, ["name", "email", "createdAt"], "candidats.csv");
            }}
          >
            Exporter CSV
          </button>
        </div>
        {loadingCandidates ? (
          <div className="text-gray-500">Chargement...</div>
        ) : filteredCandidates.length === 0 ? (
          <div className="text-gray-500">Aucun candidat en attente.</div>
        ) : (
          <div className="overflow-x-auto w-full" tabIndex={0} aria-label="Tableau des candidats en attente d'assignation">
            <table className="min-w-full bg-white rounded shadow text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Nom</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Date d'inscription</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-2">{c.name || <span className="italic text-gray-400">(Non renseigné)</span>}</td>
                    <td className="px-4 py-2">{c.email}</td>
                    <td className="px-4 py-2">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-2">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                        onClick={() => {
                          setCandidateToAssign(c);
                          setAssignModalOpen(true);
                          setSelectedEnseignantId("");
                        }}
                      >
                        Demander
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assigned Candidates Section */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Candidats assignés</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
          <input
            type="text"
            value={assignedCandidateSearch}
            onChange={e => setAssignedCandidateSearch(e.target.value)}
            placeholder="Rechercher par nom, email ou enseignant..."
            className="border p-2 rounded w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            aria-label="Rechercher un candidat assigné"
          />
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs mt-2 md:mt-0 focus:ring-2 focus:ring-green-500 focus:outline-none"
            onClick={() => {
              const exportData = filteredAssignedCandidates.map(c => ({
                name: c.name || "",
                email: c.email,
                enseignantName: c.enseignant?.name || "",
                enseignantEmail: c.enseignant?.email || "",
                status: c.status,
                noteSur100: c.evaluation?.noteSur100 || "Non évalué",
                createdAt: new Date(c.createdAt).toLocaleDateString("fr-FR")
              }));
              exportToCSV(exportData, ["name", "email", "enseignantName", "enseignantEmail", "status", "noteSur100", "createdAt"], "candidats_assignes.csv");
            }}
          >
            Exporter CSV
          </button>
        </div>
        {loadingAssigned ? (
          <div className="text-gray-500">Chargement...</div>
        ) : filteredAssignedCandidates.length === 0 ? (
          <div className="text-gray-500">Aucun candidat assigné.</div>
        ) : (
          <div className="overflow-x-auto w-full" tabIndex={0} aria-label="Tableau des candidats assignés">
            <table className="min-w-full bg-white rounded shadow text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Nom</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Enseignant assigné</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Statut</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Date d'entretien</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Date d'assignation</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Évaluation</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignedCandidates.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{c.name || <span className="italic text-gray-400">(Non renseigné)</span>}</span>
                        {c.specialite && <span className="text-xs text-gray-500">{c.specialite}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2">{c.email}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{c.enseignant?.name || <span className="italic text-gray-400">(Non renseigné)</span>}</span>
                        <span className="text-xs text-gray-500">{c.enseignant?.email}</span>
                        {c.enseignant?.specialite && <span className="text-xs text-gray-400">{c.enseignant.specialite}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    <td className="px-4 py-2">
                      {c.dateEntretien ? (
                        <div className="flex flex-col">
                          <span className="text-sm">{new Date(c.dateEntretien).toLocaleDateString("fr-FR")}</span>
                          <span className="text-xs text-gray-500">{new Date(c.dateEntretien).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                          {c.meetLink && (
                            <a 
                              href={c.meetLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Lien de réunion
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Non confirmé</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{new Date(c.requestCreatedAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-2">
                      {c.evaluation ? (
                        <div className="bg-blue-50 p-2 rounded border border-blue-200">
                          <div className="text-xs font-medium text-blue-800 mb-1">
                            Note: {c.evaluation.noteSur100}/100
                          </div>
                          <div className="text-xs text-blue-600 space-y-1">
                            {c.evaluation.francais && <div>Français: {c.evaluation.francais}/20</div>}
                            {c.evaluation.anglais && <div>Anglais: {c.evaluation.anglais}/20</div>}
                            {c.evaluation.motivation && <div>Motivation: {c.evaluation.motivation}/20</div>}
                            {c.evaluation.cultureGenerale && <div>Culture: {c.evaluation.cultureGenerale}/20</div>}
                            {c.evaluation.bonus && <div>Bonus: {c.evaluation.bonus}/20</div>}
                            {c.evaluation.competence && c.evaluation.competence !== 'AUCUNE' && (
                              <div>Compétence: {c.evaluation.competence}</div>
                            )}
                          </div>
                          {c.evaluation.observation && (
                            <div className="mt-1 text-xs text-blue-700 bg-blue-100 p-1 rounded">
                              {c.evaluation.observation}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Non évalué</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enseignants and Availabilities Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Enseignants disponibles pour assignation</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
          <input
            type="text"
            value={enseignantSearch}
            onChange={e => setEnseignantSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="border p-2 rounded w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            aria-label="Rechercher un enseignant"
          />
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs mt-2 md:mt-0 focus:ring-2 focus:ring-green-500 focus:outline-none"
            onClick={() => exportToCSV(filteredEnseignants, ["name", "email"], "enseignants.csv")}
          >
            Exporter CSV
          </button>
        </div>
        {loadingEnseignants ? (
          <div className="text-gray-500">Chargement...</div>
        ) : filteredEnseignants.length === 0 ? (
          <div className="text-gray-500">Aucun enseignant avec des créneaux disponibles.</div>
        ) : (
          <div className="overflow-x-auto w-full" tabIndex={0} aria-label="Tableau des enseignants disponibles">
            <table className="min-w-full bg-white rounded shadow text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Nom</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Créneaux disponibles</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnseignants.map((e) => (
                  <tr key={e.id} className="border-t align-top">
                    <td className="px-4 py-2">{e.name || <span className="italic text-gray-400">(Non renseigné)</span>}</td>
                    <td className="px-4 py-2">{e.email}</td>
                    <td className="px-4 py-2">
                      <span className="text-sm text-gray-700 font-medium">{e.disponibilites.length} créneau(x) disponible(s)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Assignment Modal */}
      {assignModalOpen && candidateToAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="assign-modal-title">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h2 id="assign-modal-title" className="text-xl font-bold mb-4">Demander un entretien</h2>
            <div className="mb-4">
              <div className="mb-2 font-semibold">Candidat :</div>
              <div>{candidateToAssign.name || <span className="italic text-gray-400">(Non renseigné)</span>}<br/>{candidateToAssign.email}</div>
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
                    // Refresh lists
                    fetchUnassignedCandidates();
                    fetchEnseignants();
                    fetchAssignedCandidates(); // Refresh assigned candidates
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
              className="space-y-4"
            >
              <label className="block mb-4" htmlFor="enseignant-select">
                Enseignant :
                <select
                  id="enseignant-select"
                  required
                  value={selectedEnseignantId}
                  onChange={e => setSelectedEnseignantId(e.target.value)}
                  className="border p-2 rounded w-full mt-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Choisir un enseignant</option>
                  {enseignants.map(e => (
                    <option key={e.id} value={e.id}>{e.name || e.email} ({e.disponibilites.length} créneau(x) disponible(s))</option>
                  ))}
                </select>
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p><strong>Note :</strong> L'enseignant recevra une notification et choisira lui-même la date/heure de l'entretien.</p>
              </div>
              {assignError && <div className="text-red-600 text-sm mb-2">{assignError}</div>}
              {assignSuccess && <div className="text-green-600 text-sm mb-2">{assignSuccess}</div>}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setAssignModalOpen(false); setCandidateToAssign(null); setAssignError(""); setAssignSuccess(""); }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  tabIndex={0}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!selectedEnseignantId || assigning}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  tabIndex={0}
                >
                  {assigning ? "Envoi..." : "Envoyer la demande"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}