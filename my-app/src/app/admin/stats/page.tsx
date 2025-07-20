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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Erreur</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Statistiques Détaillées
              </h1>
              <p className="text-gray-600">
                Analyse complète du système d'admission
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🖨️ Imprimer
              </button>
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Retour
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Statistics */}
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
                <p className="text-2xl font-bold text-blue-900">{stats.users.total}</p>
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
                <p className="text-2xl font-bold text-green-900">{stats.reservations.total}</p>
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
                <p className="text-2xl font-bold text-yellow-900">{stats.reservations.pending}</p>
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
                <p className="text-2xl font-bold text-purple-900">{stats.reservations.completed}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Répartition des Utilisateurs</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👑</span>
                  <span className="font-medium">Administrateurs</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{stats.users.admins}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👨‍🏫</span>
                  <span className="font-medium">Enseignants</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{stats.users.enseignants}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👤</span>
                  <span className="font-medium">Candidats</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{stats.users.candidats}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🎓</span>
                  <span className="font-medium">Étudiants</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{stats.users.etudiants}</span>
              </div>
            </div>
          </div>

          {/* Reservation Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Statut des Réservations</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⏳</span>
                  <span className="font-medium">En Attente</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{stats.reservations.pending}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  <span className="font-medium">Confirmées</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{stats.reservations.confirmed}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🎯</span>
                  <span className="font-medium">Terminées</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{stats.reservations.completed}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">❌</span>
                  <span className="font-medium">Annulées</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{stats.reservations.cancelled}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Résultats des Entretiens</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">{stats.reservations.accepted}</div>
              <div className="text-lg font-medium text-green-800">Acceptés</div>
              <div className="text-sm text-green-600">
                {stats.reservations.completed > 0 
                  ? `${((stats.reservations.accepted / stats.reservations.completed) * 100).toFixed(1)}%`
                  : '0%'
                } du total
              </div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-4xl font-bold text-red-600 mb-2">{stats.reservations.refused}</div>
              <div className="text-lg font-medium text-red-800">Refusés</div>
              <div className="text-sm text-red-600">
                {stats.reservations.completed > 0 
                  ? `${((stats.reservations.refused / stats.reservations.completed) * 100).toFixed(1)}%`
                  : '0%'
                } du total
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-4xl font-bold text-gray-600 mb-2">
                {stats.reservations.completed - stats.reservations.accepted - stats.reservations.refused}
              </div>
              <div className="text-lg font-medium text-gray-800">En Attente</div>
              <div className="text-sm text-gray-600">Résultat non défini</div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Activités Récentes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enseignant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Résultat
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.candidat?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.enseignant?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(activity.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(activity.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getResultBadge(activity.result)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Speciality Distribution */}
          {stats.specialityStats.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Répartition par Spécialité</h2>
              <div className="space-y-3">
                {stats.specialityStats.map((speciality) => (
                  <div key={speciality.specialite} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium capitalize">{speciality.specialite}</span>
                    <span className="text-lg font-bold text-blue-600">{speciality._count.specialite}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gouvernorat Distribution */}
          {stats.gouvernoratStats.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Répartition par Gouvernorat</h2>
              <div className="space-y-3">
                {stats.gouvernoratStats.map((gouvernorat) => (
                  <div key={gouvernorat.gouvernorat} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium capitalize">{gouvernorat.gouvernorat}</span>
                    <span className="text-lg font-bold text-green-600">{gouvernorat._count.gouvernorat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}