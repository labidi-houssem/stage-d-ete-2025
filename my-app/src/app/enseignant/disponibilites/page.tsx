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
    <div className="max-w-3xl mx-auto mt-12 bg-white rounded-lg shadow p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </span>
        <h1 className="text-2xl font-bold text-gray-900">Mes disponibilités</h1>
      </div>
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