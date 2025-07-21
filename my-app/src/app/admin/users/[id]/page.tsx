"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  nom: string;
  prenom: string;
  cin: string;
  telephone: string;
  dateDelivrance: string;
  lieuDelivrance: string;
  address: string;
  nationalite: string;
  civilite: string;
  dateNaissance: string;
  gouvernorat: string;
  specialite: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setUserId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (status === "loading" || !userId) return;
    
    if (!session) {
      router.push("/Auth/Signin");
      return;
    }
    
    if (session.user?.role !== "ADMIN") {
      router.push("/welcome");
      return;
    }

    fetchUser();
  }, [session, status, router, userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        const error = await response.json();
        setError(error.error);
      }
    } catch (error) {
      setError("Erreur lors du chargement de l'utilisateur");
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Non renseigné";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg">Chargement de l'utilisateur...</p>
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
          <Link href="/admin/users" className="text-blue-600 hover:text-blue-800">
            ← Retour à la liste des utilisateurs
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Utilisateur non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Détails de l'Utilisateur
              </h1>
              <p className="text-gray-600">
                Informations complètes de {user.prenom} {user.nom}
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href={`/admin/users/${user.id}/edit`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ✏️ Modifier
              </Link>
              <Link
                href="/admin/users"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Retour
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informations de Base
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Nom complet:</span>
                <span className="font-medium">{user.prenom} {user.nom}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Rôle:</span>
                <span>{getRoleBadge(user.role)}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Téléphone:</span>
                <span className="font-medium">{user.telephone || "Non renseigné"}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600 font-medium">CIN:</span>
                <span className="font-medium">{user.cin || "Non renseigné"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}