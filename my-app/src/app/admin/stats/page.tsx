"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  users: {
    total: number;
    admins: number;
    enseignants: number;
    candidats: number;
    etudiants: number;
  };
  reservations: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    accepted: number;
    refused: number;
  };
  recentActivities: Array<{
    id: string;
    status: string;
    result: string;
    date: string;
    heure: string;
    candidat: { name: string; email: string } | null;
    enseignant: { name: string; email: string } | null;
    createdAt: string;
  }>;
  monthlyStats: Array<{
    status: string;
    _count: { status: number };
  }>;
  specialityStats: Array<{
    specialite: string;
    _count: { specialite: number };
  }>;
  gouvernoratStats: Array<{
    gouvernorat: string;
    _count: { gouvernorat: number };
  }>;
}

export default function AdminStatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/Auth/Signin");
      return;
    }
    
    if (session.user?.role !== "ADMIN") {
      router.push("/welcome");
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const error = await response.json();
        setError(error.error);
      }
    } catch (error) {
      setError("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'EN_ATTENTE': { color: 'bg-yellow-100 text-yellow-800', text: '⏳ En Attente' },
      'CONFIRMEE': { color: 'bg-blue-100 text-blue-800', text: '✅ Confirmée' },
      'ANNULEE': { color: 'bg-red-100 text-red-800', text: '❌ Annulée' },
      'TERMINEE': { color: 'bg-green-100 text-green-800', text: '🎯 Terminée' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.EN_ATTENTE;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getResultBadge = (result: string) => {
    if (!result) return null;
    
    const resultConfig = {
      'ACCEPTER': { color: 'bg-green-100 text-green-800', text: '✅ Accepté' },
      'REFUSER': { color: 'bg-red-100 text-red-800', text: '❌ Refusé' },
      'EN_ATTENTE': { color: 'bg-yellow-100 text-yellow-800', text: '⏳ En Attente' },
    };

    const config = resultConfig[result as keyof typeof resultConfig] || resultConfig.EN_ATTENTE;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-6 text-xl font-medium text-gray-700">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-red-600 text-2xl mb-4 font-bold">❌ Erreur</div>
          <p className="text-gray-600 mb-6 text-lg">{error}</p>
          <Link href="/admin/dashboard" className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-lg">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-xl text-red-600 font-bold">Aucune donnée disponible</p>
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
            Statistiques Détaillées
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Analyse complète du système d'admission ESPRIT
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-700 mx-auto rounded-full"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
          <button
            onClick={() => window.print()}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🖨️ Imprimer les statistiques
          </button>
          <Link
            href="/admin/dashboard"
            className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🔙 Retour au tableau de bord
          </Link>
        </div>

        {/* Overview Statistics */}
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
                <p className="text-3xl font-bold text-blue-900">{stats.users.total}</p>
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
                <p className="text-3xl font-bold text-green-900">{stats.reservations.total}</p>
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
                <p className="text-3xl font-bold text-yellow-900">{stats.reservations.pending}</p>
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
                <p className="text-3xl font-bold text-purple-900">{stats.reservations.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Statistics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* User Statistics */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Répartition des Utilisateurs
              </h2>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👑</span>
                    <span className="font-medium text-red-800">Administrateurs</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{stats.users.admins}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👨‍🏫</span>
                    <span className="font-medium text-blue-800">Enseignants</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{stats.users.enseignants}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👤</span>
                    <span className="font-medium text-green-800">Candidats</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{stats.users.candidats}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🎓</span>
                    <span className="font-medium text-yellow-800">Étudiants</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">{stats.users.etudiants}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reservation Statistics */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Statut des Réservations
              </h2>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⏳</span>
                    <span className="font-medium text-yellow-800">En Attente</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">{stats.reservations.pending}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">✅</span>
                    <span className="font-medium text-blue-800">Confirmées</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{stats.reservations.confirmed}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🎯</span>
                    <span className="font-medium text-green-800">Terminées</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{stats.reservations.completed}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">❌</span>
                    <span className="font-medium text-red-800">Annulées</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{stats.reservations.cancelled}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Statistics */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Résultats des Entretiens
            </h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-200">
                <div className="text-5xl font-bold text-green-600 mb-3">{stats.reservations.accepted}</div>
                <div className="text-xl font-medium text-green-800 mb-2">✅ Acceptés</div>
                <div className="text-sm text-green-600">
                  {stats.reservations.completed > 0 
                    ? `${((stats.reservations.accepted / stats.reservations.completed) * 100).toFixed(1)}%`
                    : '0%'
                  } du total
                </div>
              </div>
              
              <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-200">
                <div className="text-5xl font-bold text-red-600 mb-3">{stats.reservations.refused}</div>
                <div className="text-xl font-medium text-red-800 mb-2">❌ Refusés</div>
                <div className="text-sm text-red-600">
                  {stats.reservations.completed > 0 
                    ? `${((stats.reservations.refused / stats.reservations.completed) * 100).toFixed(1)}%`
                    : '0%'
                  } du total
                </div>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="text-5xl font-bold text-gray-600 mb-3">
                  {stats.reservations.completed - stats.reservations.accepted - stats.reservations.refused}
                </div>
                <div className="text-xl font-medium text-gray-800 mb-2">⏳ En Attente</div>
                <div className="text-sm text-gray-600">Résultat non défini</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Activités Récentes
            </h2>
          </div>
          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Candidat</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Enseignant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Résultat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {activity.candidat?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {activity.enseignant?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(activity.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(activity.status)}
                      </td>
                      <td className="px-6 py-4">
                        {getResultBadge(activity.result)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Speciality Distribution */}
          {stats.specialityStats.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Répartition par Spécialité
                </h2>
              </div>
              <div className="p-8">
                <div className="space-y-3">
                  {stats.specialityStats.map((speciality) => (
                    <div key={speciality.specialite} className="flex justify-between items-center p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                      <span className="font-medium capitalize text-indigo-800">{speciality.specialite}</span>
                      <span className="text-lg font-bold text-indigo-600">{speciality._count.specialite}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Gouvernorat Distribution */}
          {stats.gouvernoratStats.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Répartition par Gouvernorat
                </h2>
              </div>
              <div className="p-8">
                <div className="space-y-3">
                  {stats.gouvernoratStats.map((gouvernorat) => (
                    <div key={gouvernorat.gouvernorat} className="flex justify-between items-center p-4 bg-teal-50 rounded-xl border border-teal-200">
                      <span className="font-medium capitalize text-teal-800">{gouvernorat.gouvernorat}</span>
                      <span className="text-lg font-bold text-teal-600">{gouvernorat._count.gouvernorat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}