"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/users">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gestion des Utilisateurs
              </h3>
              <p className="text-gray-600">
                Consultez, modifiez et gérez tous les utilisateurs du système
              </p>
            </div>
          </Link>

          <Link href="/admin/create-users">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Créer un Utilisateur
              </h3>
              <p className="text-gray-600">
                Ajoutez de nouveaux utilisateurs au système
              </p>
            </div>
          </Link>

          <Link href="/admin/stats">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Statistiques Détaillées
              </h3>
              <p className="text-gray-600">
                Consultez les statistiques détaillées du système
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Actions Rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/admin/users")}
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <div className="font-medium text-blue-900">👥 Voir tous les utilisateurs</div>
              <div className="text-sm text-blue-600">Gérer les comptes</div>
            </button>
            
            <button
              onClick={() => router.push("/admin/create-users")}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <div className="font-medium text-green-900">➕ Créer un utilisateur</div>
              <div className="text-sm text-green-600">Ajouter un nouveau compte</div>
            </button>
            
            <button
              onClick={() => router.push("/calendar")}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
            >
              <div className="font-medium text-purple-900">📅 Voir le calendrier</div>
              <div className="text-sm text-purple-600">Gérer les entretiens</div>
            </button>
            
            <button
              onClick={() => router.push("/admin/stats")}
              className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-left"
            >
              <div className="font-medium text-indigo-900">📊 Statistiques</div>
              <div className="text-sm text-indigo-600">Analyse détaillée</div>
            </button>
            
            <button
              onClick={() => router.push("/welcome")}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <div className="font-medium text-gray-900">🏠 Retour à l'accueil</div>
              <div className="text-sm text-gray-600">Page d'accueil</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}