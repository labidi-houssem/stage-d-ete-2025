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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 bg-white rounded-lg shadow p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </span>
        <h1 className="text-2xl font-bold text-gray-900">Mes disponibilités</h1>
      </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? "Annuler" : "+ Ajouter une disponibilité"}
        </button>
      </div>

      {/* Add New Disponibilite Form */}
      {showAddForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Ajouter une nouvelle disponibilité</h2>
          <form onSubmit={handleAddDisponibilite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de début
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de fin
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée rapide
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Appliquer la durée
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? "Ajout en cours..." : "Ajouter la disponibilité"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ date: "", startTime: "", endTime: "", duration: "60" });
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Disponibilites */}
      <div className="divide-y divide-gray-200">
        {disponibilites.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Aucune disponibilité créée pour le moment
          </div>
        ) : (
          disponibilites.map((disponibilite) => (
            <div key={disponibilite.id} className="py-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-lg font-medium">
                      {formatDateTime(disponibilite.dateDebut)} - {formatDateTime(disponibilite.dateFin)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Créé le {new Date(disponibilite.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  {/* Reservations */}
                  {disponibilite.reservations.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Réservations ({disponibilite.reservations.length})
                      </h4>
                      <div className="space-y-2">
                        {disponibilite.reservations.map((reservation) => (
                          <div
                            key={reservation.id}
                            className="bg-gray-50 p-3 rounded-md"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">
                                  {reservation.candidat.nom} {reservation.candidat.prenom}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {reservation.candidat.email} - {reservation.candidat.specialite}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
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
                <div className="ml-4">
                  {disponibilite.reservations.length === 0 && (
                    <button
                      onClick={() => handleDelete(disponibilite.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
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
  );
} 