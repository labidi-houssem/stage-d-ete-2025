"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CreateUsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "ENSEIGNANT",
    nom: "",
    prenom: "",
    telephone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Authentication check
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
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création de l\'utilisateur');
      }

      setMessage(`✅ ${result.message}`);
      setFormData({
        email: "",
        password: "",
        role: "ENSEIGNANT",
        nom: "",
        prenom: "",
        telephone: "",
      });
    } catch (error) {
      setMessage(`❌ ${error instanceof Error ? error.message : 'Erreur lors de la création de l\'utilisateur'}`);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-3xl shadow-xl mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Créer un Utilisateur
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Ajoutez de nouveaux utilisateurs à la plateforme
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-700 mx-auto rounded-full"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
          <button
            onClick={() => router.push("/admin/users")}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            👥 Voir tous les utilisateurs
          </button>
          <button
            onClick={() => router.push("/welcome")}
            className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🔙 Retour
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Informations de l'utilisateur
            </h2>
          </div>
          
          <div className="p-8">
            {/* Message Display */}
            {message && (
              <div className={`mb-8 p-6 rounded-2xl border-2 ${
                message.startsWith('✅') 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  {message.startsWith('✅') ? (
                    <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className="font-medium text-lg">{message}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Role Selection */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
                <label className="block text-lg font-semibold text-red-800 mb-4">
                  🎯 Rôle de l'utilisateur *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-lg font-medium bg-white"
                  required
                >
                  <option value="ADMIN">👑 Administrateur</option>
                  <option value="ENSEIGNANT">👨‍🏫 Enseignant</option>
                  
                </select>
                <p className="text-sm text-red-600 mt-2">
                  Le rôle détermine les permissions et l'accès de l'utilisateur
                </p>
              </div>

              {/* Account Information */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  🔐 Informations de compte
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      📧 Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="exemple@esprit.tn"
                      className="w-full px-6 py-4 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 text-lg bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      🔒 Mot de passe *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mot de passe sécurisé"
                      className="w-full px-6 py-4 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 text-lg bg-white"
                      required
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Minimum 8 caractères recommandé
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  👤 Informations personnelles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      📝 Prénom *
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      placeholder="Prénom"
                      className="w-full px-6 py-4 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all duration-200 text-lg bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      📝 Nom *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      placeholder="Nom"
                      className="w-full px-6 py-4 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all duration-200 text-lg bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    📞 Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="+216 XX XXX XXX"
                    className="w-full px-6 py-4 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all duration-200 text-lg bg-white"
                  />
                  <p className="text-xs text-green-600 mt-1">
                    Optionnel - Format international recommandé
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-12 py-5 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:outline-none ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Création en cours...
                    </span>
                  ) : (
                    '🚀 Créer l\'utilisateur'
                  )}
                </button>
              </div>
            </form>

            {/* Additional Info */}
            <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informations importantes
              </h4>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• L'utilisateur recevra un email de confirmation</li>
                <li>• Le mot de passe peut être modifié par l'administrateur</li>
                <li>• Les permissions sont automatiquement configurées selon le rôle</li>
                <li>• L'utilisateur pourra se connecter immédiatement après la création</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 