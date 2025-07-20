"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des utilisateurs');
      }

      setUsers(data.users);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la récupération des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'ADMIN': { color: 'bg-red-100 text-red-800', text: '👑 Admin' },
      'ENSEIGNANT': { color: 'bg-blue-100 text-blue-800', text: '👨‍🏫 Enseignant' },
      'CANDIDAT': { color: 'bg-green-100 text-green-800', text: '👤 Candidat' },
      'ETUDIANT': { color: 'bg-yellow-100 text-yellow-800', text: '🎓 Étudiant' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.CANDIDAT;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail} ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('✅ Utilisateur supprimé avec succès!');
        fetchUsers(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`❌ ${error.error}`);
      }
    } catch (error) {
      alert('❌ Erreur lors de la suppression');
    }
  };

  // Calculate statistics
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    enseignants: users.filter(u => u.role === 'ENSEIGNANT').length,
    candidats: users.filter(u => u.role === 'CANDIDAT').length,
    etudiants: users.filter(u => u.role === 'ETUDIANT').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion des Utilisateurs
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/admin/create-users")}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Créer un utilisateur
              </button>
              <button
                onClick={() => router.push("/welcome")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Retour
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </div>

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

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.prenom?.charAt(0) || user.nom?.charAt(0) || '?'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || `${user.prenom} ${user.nom}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.telephone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          👁️ Voir
                        </button>
                        <button 
                          onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          ✏️ Modifier
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Total: {users.length} utilisateur(s)
          </div>
        </div>
      </div>
    </div>
  );
} 