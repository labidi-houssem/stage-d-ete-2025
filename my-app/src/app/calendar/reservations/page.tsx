"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Reservation {
  id: string;
  status: string;
  result?: string;
  createdAt: string;
  candidat: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    specialite: string;
    telephone: string;
  };
  disponibilite: {
    id: string;
    dateDebut: string;
    dateFin: string;
  };
}

export default function ReservationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  // For result management
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedResult, setSelectedResult] = useState<string>("");
  const [managingResult, setManagingResult] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || (session.user as any)?.role !== "ENSEIGNANT") {
      router.push("/calendar");
      return;
    }

    fetchReservations();
  }, [session, status, router]);

  const fetchReservations = async () => {
    try {
      const response = await fetch("/api/disponibilite");
      if (response.ok) {
        const data = await response.json();
        // Extract all reservations from disponibilites
        const allReservations: Reservation[] = [];
        data.disponibilites.forEach((disponibilite: any) => {
          disponibilite.reservations.forEach((reservation: any) => {
            allReservations.push({
              ...reservation,
              disponibilite: {
                id: disponibilite.id,
                dateDebut: disponibilite.dateDebut,
                dateFin: disponibilite.dateFin,
              },
            });
          });
        });
        setReservations(allReservations);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (reservationId: string, newStatus: string) => {
    setUpdating(reservationId);

    try {
      const response = await fetch(`/api/reservation/${reservationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert("✅ Statut mis à jour avec succès!");
        fetchReservations();
      } else {
        const error = await response.json();
        alert(`❌ ${error.error}`);
      }
    } catch (error) {
      alert("❌ Erreur lors de la mise à jour du statut");
    } finally {
      setUpdating(null);
    }
  };

  const handleMarkAsTerminee = async (reservationId: string, result: string) => {
    if (!result || (result !== "ACCEPTER" && result !== "REFUSER")) {
      alert("Veuillez sélectionner un résultat valide");
      return;
    }

    setManagingResult(true);
    try {
      const res = await fetch(`/api/reservation/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "TERMINEE", result }),
      });

      if (res.ok) {
        if (result === "ACCEPTER") {
          alert(`✅ Entretien marqué comme terminé avec le résultat: Accepté\n\n🎓 Le rôle du candidat a été automatiquement mis à jour en ETUDIANT.`);
        } else {
          alert(`✅ Entretien marqué comme terminé avec le résultat: Refusé`);
        }
        fetchReservations(); // Refresh data
        setResultModalOpen(false);
        setSelectedReservation(null);
      } else {
        const error = await res.json();
        alert(`❌ ${error.error}`);
      }
    } catch (e) {
      alert("Erreur lors de la mise à jour du statut");
    } finally {
      setManagingResult(false);
    }
  };

  const openResultModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setSelectedResult("");
    setResultModalOpen(true);
  };

  const getResultDisplay = (reservation: Reservation) => {
    if (reservation.status !== "TERMINEE") return null;
    
    if (reservation.result === "ACCEPTER") {
      return (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          ✅ Accepté
        </span>
      );
    } else if (reservation.result === "REFUSER") {
      return (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
          ❌ Refusé
        </span>
      );
    } else {
      return (
        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
          ⏳ En attente
        </span>
      );
    }
  };

  const getResultAction = (reservation: Reservation) => {
    if (reservation.status === "TERMINEE") {
      return getResultDisplay(reservation);
    } else if (reservation.status === "EN_ATTENTE" || reservation.status === "CONFIRMEE") {
      return (
        <button
          onClick={() => openResultModal(reservation)}
          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
        >
          Marquer Terminé
        </button>
      );
    }
    return null;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
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

  const getStatusOptions = (currentStatus: string) => {
    const allStatuses = ["EN_ATTENTE", "CONFIRMEE", "ANNULEE"];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const filteredReservations = reservations.filter(reservation => {
    if (filterStatus === "all") return true;
    return reservation.status === filterStatus;
  });

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mes entretiens réservés
        </h1>
        <p className="text-gray-600">
          Consultez et gérez tous vos entretiens d'admission
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Filtres</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "all"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Tous ({reservations.length})
          </button>
          <button
            onClick={() => setFilterStatus("EN_ATTENTE")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "EN_ATTENTE"
                ? "bg-yellow-500 text-white"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            }`}
          >
            En attente ({reservations.filter(r => r.status === "EN_ATTENTE").length})
          </button>
          <button
            onClick={() => setFilterStatus("CONFIRMEE")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "CONFIRMEE"
                ? "bg-green-500 text-white"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            Confirmés ({reservations.filter(r => r.status === "CONFIRMEE").length})
          </button>
          <button
            onClick={() => setFilterStatus("ANNULEE")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "ANNULEE"
                ? "bg-red-500 text-white"
                : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
          >
            Annulés ({reservations.filter(r => r.status === "ANNULEE").length})
          </button>
          <button
            onClick={() => setFilterStatus("TERMINEE")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === "TERMINEE"
                ? "bg-blue-500 text-white"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            }`}
          >
            Terminés ({reservations.filter(r => r.status === "TERMINEE").length})
          </button>
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            Entretiens ({filteredReservations.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredReservations.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {filterStatus === "all" 
                ? "Aucun entretien réservé pour le moment" 
                : `Aucun entretien avec le statut "${filterStatus.replace("_", " ")}"`
              }
            </div>
          ) : (
            filteredReservations.map((reservation) => (
              <div key={reservation.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <div className="text-blue-900 font-semibold">
                          {formatDate(reservation.disponibilite.dateDebut)}
                        </div>
                        <div className="text-blue-700 text-sm">
                          {formatTime(reservation.disponibilite.dateDebut)} - {formatTime(reservation.disponibilite.dateFin)}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {reservation.candidat.nom} {reservation.candidat.prenom}
                        </h3>
                        <p className="text-gray-600">
                          {reservation.candidat.email} - {reservation.candidat.specialite}
                        </p>
                        {reservation.candidat.telephone && (
                          <p className="text-sm text-gray-500">
                            📞 {reservation.candidat.telephone}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Réservé le {formatDateTime(reservation.createdAt)}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        reservation.status
                      )}`}
                    >
                      {reservation.status.replace("_", " ")}
                    </span>
                    
                    {/* Show result display for TERMINEE reservations */}
                    {getResultDisplay(reservation)}
                    
                    {/* Show result action button for active reservations */}
                    {getResultAction(reservation)}
                    
                    {/* Status change dropdown for non-ANNULEE reservations */}
                    {reservation.status !== "ANNULEE" && reservation.status !== "TERMINEE" && (
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            updateReservationStatus(reservation.id, e.target.value);
                          }
                        }}
                        disabled={updating === reservation.id}
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                      >
                        <option value="">Changer statut</option>
                        {getStatusOptions(reservation.status).map((status) => (
                          <option key={status} value={status}>
                            {status.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <button
          onClick={() => router.push("/calendar")}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Retour au calendrier
        </button>
      </div>

      {/* Result Management Modal */}
      {resultModalOpen && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Marquer l'entretien comme terminé
                </h2>
                <button
                  onClick={() => setResultModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  Candidat: <strong>{selectedReservation.candidat.prenom} {selectedReservation.candidat.nom}</strong>
                </p>
                <p className="text-gray-600 mb-4">
                  Spécialité: <strong>{selectedReservation.candidat.specialite}</strong>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Résultat de l'entretien
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="result"
                      value="ACCEPTER"
                      checked={selectedResult === "ACCEPTER"}
                      onChange={(e) => setSelectedResult(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-green-700">✅ Accepter le candidat</span>
                    <span className="text-xs text-gray-500 ml-2">(Le rôle sera automatiquement mis à jour en ETUDIANT)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="result"
                      value="REFUSER"
                      checked={selectedResult === "REFUSER"}
                      onChange={(e) => setSelectedResult(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-red-700">❌ Refuser le candidat</span>
                    <span className="text-xs text-gray-500 ml-2">(Le candidat peut toujours accepter pour devenir ETUDIANT)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setResultModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleMarkAsTerminee(selectedReservation.id, selectedResult)}
                  disabled={!selectedResult || managingResult}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {managingResult ? "Mise à jour..." : "Confirmer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 