"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Evaluation {
  id: string;
  candidat: {
    id: string;
    name?: string;
    email: string;
    prenom?: string;
    nom?: string;
  };
  enseignant: {
    id: string;
    name?: string;
    email: string;
  };
  francais?: number;
  anglais?: number;
  motivation?: number;
  cultureGenerale?: number;
  bonus?: number;
  noteSur100: number;
  competence?: string;
  observation?: string;
  createdAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export default function EvaluationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/Auth/Signin");
      return;
    }
    fetchEvaluations();
  }, [session, status, router]);

  const fetchEvaluations = async () => {
    try {
      const response = await fetch("/api/admin/evaluations");
      if (response.ok) {
        const data = await response.json();
        setEvaluations(data.evaluations);
      }
    } catch (error) {
      console.error("Error fetching evaluations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (evaluationId: string, decision: 'ACCEPTED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/admin/evaluations/${evaluationId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ decision }),
      });

      if (response.ok) {
        // Refresh evaluations
        fetchEvaluations();
        alert(decision === 'ACCEPTED' ? 'Candidat accepté et converti en étudiant!' : 'Candidat refusé.');
      } else {
        alert('Erreur lors de la prise de décision.');
      }
    } catch (error) {
      console.error("Error making decision:", error);
      alert('Erreur lors de la prise de décision.');
    }
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = 
      evaluation.candidat.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evaluation.candidat.name && evaluation.candidat.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (evaluation.candidat.prenom && evaluation.candidat.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (evaluation.candidat.nom && evaluation.candidat.nom.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || evaluation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement des évaluations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3 3L22 4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.51 0 2.93.37 4.18 1.03" />
              </svg>
              Évaluations des Candidats
            </h1>
            <p className="text-red-100 mt-2">Gérez les évaluations et décidez de l'admission des candidats</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, email du candidat..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="ACCEPTED">Accepté</option>
                <option value="REJECTED">Refusé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Evaluations List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {filteredEvaluations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3 3L22 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune évaluation trouvée</h3>
              <p className="text-gray-500">Aucune évaluation ne correspond à vos critères de recherche.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Candidat</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Enseignant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Note</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Détails</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEvaluations.map((evaluation) => (
                    <tr key={evaluation.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {evaluation.candidat.name || `${evaluation.candidat.prenom || ''} ${evaluation.candidat.nom || ''}`.trim() || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{evaluation.candidat.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{evaluation.enseignant.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{evaluation.enseignant.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-red-600">{evaluation.noteSur100}/100</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          {evaluation.francais && <div>🇫🇷 Français: {evaluation.francais}/20</div>}
                          {evaluation.anglais && <div>🇬🇧 Anglais: {evaluation.anglais}/20</div>}
                          {evaluation.motivation && <div>💪 Motivation: {evaluation.motivation}/20</div>}
                          {evaluation.cultureGenerale && <div>📚 Culture: {evaluation.cultureGenerale}/20</div>}
                          {evaluation.bonus && <div>⭐ Bonus: {evaluation.bonus}/20</div>}
                          {evaluation.competence && evaluation.competence !== 'AUCUNE' && (
                            <div>🎯 Compétence: {evaluation.competence}</div>
                          )}
                        </div>
                        {evaluation.observation && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                            💭 {evaluation.observation}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          evaluation.status === 'ACCEPTED' 
                            ? 'bg-green-100 text-green-800'
                            : evaluation.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {evaluation.status === 'ACCEPTED' ? 'Accepté' : 
                           evaluation.status === 'REJECTED' ? 'Refusé' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {evaluation.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDecision(evaluation.id, 'ACCEPTED')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              ✓ Accepter
                            </button>
                            <button
                              onClick={() => handleDecision(evaluation.id, 'REJECTED')}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            >
                              ✗ Refuser
                            </button>
                          </div>
                        )}
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
  );
}
