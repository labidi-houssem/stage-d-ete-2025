"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Disponibilite {
  id: string;
  dateDebut: string;
  dateFin: string;
  createdAt: string;
  reservations: Array<{
    id: string;
    candidat: {
      id: string;
      nom: string;
      prenom: string;
      email: string;
      specialite: string;
    };
    status: string;
  }>;
}

export default function MesDisponibilitesPage() {
  const { data: session, status } = useSession();
  const [disponibilites, setDisponibilites] = useState<Disponibilite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    duration: "60" // Default 60 minutes
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "ENSEIGNANT") return;
    fetchDisponibilites();
  }, [session, status]);

  const fetchDisponibilites = async () => {
    try {
      const response = await fetch("/api/disponibilite");
      if (response.ok) {
        const data = await response.json();
        setDisponibilites(data.disponibilites);
      }
    } catch (error) {
      console.error("Error fetching disponibilites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette disponibilité?")) {
      return;
    }
    try {
      const response = await fetch(`/api/disponibilite/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("✅ Disponibilité supprimée avec succès!");
        fetchDisponibilites();
      } else {
        const error = await response.json();
        alert(`❌ ${error.error}`);
      }
    } catch (error) {
      alert("❌ Erreur lors de la suppression");
    }
  };

  const handleAddDisponibilite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.startTime || !formData.endTime) {
      alert("❌ Veuillez remplir tous les champs");
      return;
    }

    setSubmitting(true);
    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      if (endDateTime <= startDateTime) {
        alert("❌ L'heure de fin doit être après l'heure de début");
        return;
      }

      const response = await fetch("/api/disponibilite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateDebut: startDateTime.toISOString(),
          dateFin: endDateTime.toISOString(),
        }),
      });

      if (response.ok) {
        alert("✅ Disponibilité ajoutée avec succès!");
        setFormData({ date: "", startTime: "", endTime: "", duration: "60" });
        setShowAddForm(false);
        fetchDisponibilites();
      } else {
        const error = await response.json();
        alert(`❌ ${error.error || "Erreur lors de l'ajout"}`);
      }
    } catch (error) {
      alert("❌ Erreur lors de l'ajout de la disponibilité");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDurationChange = (duration: string) => {
    setFormData(prev => ({ ...prev, duration }));
    if (formData.startTime) {
      const startTime = new Date(`2000-01-01T${formData.startTime}`);
      const endTime = new Date(startTime.getTime() + parseInt(duration) * 60000);
      setFormData(prev => ({ 
        ...prev, 
        duration,
        endTime: endTime.toTimeString().slice(0, 5)
      }));
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMEE":
        return "bg-green-100 text-green-800";
      case "ANNULEE":
        return "bg-red-100 text-red-800";
      case "TERMINEE":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-700">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent">
                  Mes disponibilités
                </h1>
                <p className="text-gray-700 text-lg">Gérez vos créneaux d'entretien</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
                showAddForm
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
              }`}
            >
              {showAddForm ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Annuler
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ajouter une disponibilité
                </>
              )}
            </button>
          </div>
        </div>

        {/* Add New Disponibilite Form */}
        {showAddForm && (
          <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Ajouter une nouvelle disponibilité</h2>
            </div>

            <form onSubmit={handleAddDisponibilite} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Duration Helper Section */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Durée rapide
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => handleDurationChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-white"
                    >
                      <option value="30">30 minutes</option>
                      <option value="60">1 heure</option>
                      <option value="90">1h30</option>
                      <option value="120">2 heures</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.startTime) {
                        const startTime = new Date(`2000-01-01T${formData.startTime}`);
                        const endTime = new Date(startTime.getTime() + parseInt(formData.duration) * 60000);
                        setFormData(prev => ({
                          ...prev,
                          endTime: endTime.toTimeString().slice(0, 5)
                        }));
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 focus:outline-none transition-all duration-200 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Appliquer la durée
                  </button>
                </div>
                <p className="text-sm text-red-600 mt-2">
                  💡 Sélectionnez une heure de début, puis utilisez ce raccourci pour calculer automatiquement l'heure de fin.
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-red-200 focus:outline-none transition-all duration-200 font-medium shadow-lg"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Ajouter la disponibilité
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ date: "", startTime: "", endTime: "", duration: "60" });
                  }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 focus:outline-none transition-all duration-200 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Disponibilites */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
          <div className="px-6 md:px-8 py-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Mes créneaux ({disponibilites.length})
              </h2>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {disponibilites.length === 0 ? (
              <div className="px-6 md:px-8 py-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune disponibilité créée</h3>
                <p className="text-gray-600 mb-6">Commencez par ajouter vos créneaux d'entretien.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ajouter ma première disponibilité
                </button>
              </div>
            ) : (
              disponibilites.map((disponibilite) => (
                <div key={disponibilite.id} className="p-6 md:p-8 hover:bg-white/50 transition-all duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      {/* Date/Time Display */}
                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <div className="bg-gradient-to-r from-red-500 to-rose-500 p-4 rounded-2xl text-white shadow-lg flex-shrink-0">
                          <div className="text-center">
                            <div className="text-lg font-bold">
                              {new Date(disponibilite.dateDebut).toLocaleDateString("fr-FR", { day: "2-digit" })}
                            </div>
                            <div className="text-sm opacity-90">
                              {new Date(disponibilite.dateDebut).toLocaleDateString("fr-FR", { month: "short" })}
                            </div>
                            <div className="text-xs opacity-75 mt-1">
                              {new Date(disponibilite.dateDebut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} - {new Date(disponibilite.dateFin).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {new Date(disponibilite.dateDebut).toLocaleDateString("fr-FR", {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Créé le {new Date(disponibilite.createdAt).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      </div>
                      {/* Reservations */}
                      {disponibilite.reservations.length > 0 && (
                        <div className="mt-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-gray-800">
                              Réservations ({disponibilite.reservations.length})
                            </h4>
                          </div>
                          <div className="grid gap-3">
                            {disponibilite.reservations.map((reservation) => (
                              <div
                                key={reservation.id}
                                className="bg-white/80 border border-gray-200 p-4 rounded-xl shadow-sm"
                              >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-white font-semibold text-sm">
                                        {reservation.candidat.prenom.charAt(0).toUpperCase()}{reservation.candidat.nom.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-900">
                                        {reservation.candidat.nom} {reservation.candidat.prenom}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {reservation.candidat.email}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {reservation.candidat.specialite}
                                      </p>
                                    </div>
                                  </div>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                      reservation.status
                                    )}`}
                                  >
                                    {reservation.status.replace("_", " ")}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      {disponibilite.reservations.length === 0 && (
                        <button
                          onClick={() => handleDelete(disponibilite.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium border border-red-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}