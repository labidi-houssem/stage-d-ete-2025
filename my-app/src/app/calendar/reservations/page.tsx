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
  // For meet link confirmation
  const [meetLinkModalOpen, setMeetLinkModalOpen] = useState(false);
  const [meetLinkInput, setMeetLinkInput] = useState("");
  const [reservationToConfirm, setReservationToConfirm] = useState<Reservation | null>(null);
  // Add a new state to track the status being set
  const [statusToSet, setStatusToSet] = useState<string>("");
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [evalFields, setEvalFields] = useState({
    francais: "",
    anglais: "",
    motivation: "",
    cultureGenerale: "",
    bonus: "",
    noteSur100: "",
    observation: "",
    competence: "",
  });

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
    setEvaluationModalOpen(true);
  };

  const openMeetLinkModal = (reservation: Reservation) => {
    setReservationToConfirm(reservation);
    setMeetLinkInput("");
    setMeetLinkModalOpen(true);
  };

  const handleConfirmWithMeetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationToConfirm) return;
    setUpdating(reservationToConfirm.id);
    try {
      const response = await fetch(`/api/reservation/${reservationToConfirm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMEE", meetLink: meetLinkInput }),
      });
      if (response.ok) {
        alert("Réservation confirmée !");
        fetchReservations();
        setMeetLinkModalOpen(false);
        setReservationToConfirm(null);
      } else {
        const error = await response.json();
        alert(`❌ ${error.error}`);
      }
    } catch (error) {
      alert("❌ Erreur lors de la confirmation");
    } finally {
      setUpdating(null);
    }
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 focus:ring-4 focus:ring-red-200 focus:outline-none transition-all duration-200 font-medium shadow-lg text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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

  // Add a helper to filter past reservations (historique)
  const now = new Date();
  const historiqueReservations = reservations.filter(r => new Date(r.disponibilite.dateFin) < now);

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
      <div className="max-w-7xl ml-auto mr-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent">
              Mes entretiens réservés
            </h1>
          </div>
          <p className="text-gray-700 text-lg">
            Consultez et gérez tous vos entretiens d'admission
          </p>
        </div>

      {/* Filter Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Filtres</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
              filterStatus === "all"
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Tous ({reservations.length})
            </span>
          </button>
          <button
            onClick={() => setFilterStatus("EN_ATTENTE")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
              filterStatus === "EN_ATTENTE"
                ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg"
                : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              En attente ({reservations.filter(r => r.status === "EN_ATTENTE").length})
            </span>
          </button>
          <button
            onClick={() => setFilterStatus("CONFIRMEE")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
              filterStatus === "CONFIRMEE"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirmés ({reservations.filter(r => r.status === "CONFIRMEE").length})
            </span>
          </button>
          <button
            onClick={() => setFilterStatus("ANNULEE")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
              filterStatus === "ANNULEE"
                ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg"
                : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annulés ({reservations.filter(r => r.status === "ANNULEE").length})
            </span>
          </button>
          <button
            onClick={() => setFilterStatus("TERMINEE")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
              filterStatus === "TERMINEE"
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Terminés ({reservations.filter(r => r.status === "TERMINEE").length})
            </span>
          </button>
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
        <div className="px-6 md:px-8 py-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Entretiens ({filteredReservations.length})
            </h2>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredReservations.length === 0 ? (
            <div className="px-6 md:px-8 py-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {filterStatus === "all"
                  ? "Aucun entretien réservé"
                  : `Aucun entretien "${filterStatus.replace("_", " ")}"`
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {filterStatus === "all"
                  ? "Les nouveaux entretiens apparaîtront ici."
                  : "Essayez un autre filtre pour voir d'autres entretiens."
                }
              </p>

              {/* Helpful guidance for enseignants */}
              {filterStatus === "all" && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-lg mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-red-800 font-semibold">Comment voir mes entretiens ?</h3>
                  </div>
                  <p className="text-red-700 text-sm mb-4">
                    Pour voir vos entretiens ici, vous devez d'abord accepter les demandes d'entretien.
                  </p>
                  <div className="space-y-3 text-sm text-red-600 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      Allez dans <strong>"Demandes d'entretien"</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      Acceptez les demandes en attente
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      Choisissez une date/heure et lien de réunion
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      Vos entretiens apparaîtront ici
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/enseignant/interview-requests")}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium shadow-lg"
                  >
                    Voir les demandes d'entretien
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredReservations.map((reservation) => (
              <div key={reservation.id} className="p-6 md:p-8 hover:bg-white/50 transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start gap-6 mb-4">
                      {/* Date/Time Card */}
                      <div className="bg-gradient-to-r from-red-500 to-rose-500 p-4 rounded-2xl text-white shadow-lg flex-shrink-0">
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {new Date(reservation.disponibilite.dateDebut).toLocaleDateString("fr-FR", { day: "2-digit" })}
                          </div>
                          <div className="text-sm opacity-90">
                            {new Date(reservation.disponibilite.dateDebut).toLocaleDateString("fr-FR", { month: "short" })}
                          </div>
                          <div className="text-xs opacity-75 mt-1">
                            {formatTime(reservation.disponibilite.dateDebut)} - {formatTime(reservation.disponibilite.dateFin)}
                          </div>
                        </div>
                      </div>

                      {/* Candidate Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-white font-semibold text-lg">
                              {reservation.candidat.prenom.charAt(0).toUpperCase()}{reservation.candidat.nom.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {reservation.candidat.nom} {reservation.candidat.prenom}
                            </h3>
                            <div className="space-y-1">
                              <p className="text-gray-600 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                                {reservation.candidat.email}
                              </p>
                              <p className="text-gray-600 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {reservation.candidat.specialite}
                              </p>
                              {reservation.candidat.telephone && (
                                <p className="text-gray-600 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {reservation.candidat.telephone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Réservé le {formatDateTime(reservation.createdAt)}
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex flex-col gap-4 lg:items-end">
                    {/* Status Badge */}
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm ${getStatusColor(
                          reservation.status
                        )}`}
                      >
                        {reservation.status === "EN_ATTENTE" && (
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {reservation.status === "CONFIRMEE" && (
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {reservation.status === "ANNULEE" && (
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        {reservation.status === "TERMINEE" && (
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {reservation.status.replace("_", " ")}
                      </span>

                      {/* Show result display for TERMINEE reservations */}
                      {getResultDisplay(reservation)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                      {/* Show result action button for active reservations */}
                      {getResultAction(reservation)}

                      {/* Status change dropdown for non-ANNULEE reservations */}
                      {reservation.status !== "ANNULEE" && reservation.status !== "TERMINEE" && (
                        <select
                          value=""
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            if (!newStatus) return;
                            if (newStatus === "ANNULEE" || newStatus === "TERMINEE") {
                              updateReservationStatus(reservation.id, newStatus);
                            } else {
                              setReservationToConfirm(reservation);
                              setStatusToSet(newStatus);
                              setMeetLinkInput("");
                              setMeetLinkModalOpen(true);
                            }
                          }}
                          disabled={updating === reservation.id}
                          className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-white"
                        >
                          <option value="">Changer le statut</option>
                          {getStatusOptions(reservation.status).map((option) => (
                            <option key={option} value={option}>{option.replace("_", " ")}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Historique des réservations */}
      <div className="mt-10">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Historique des réservations</h2>
          </div>

          {historiqueReservations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500">Aucune réservation passée.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historiqueReservations.map((r) => (
                <div key={r.id} className="bg-white/50 rounded-xl p-4 border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        {new Date(r.disponibilite.dateDebut).toLocaleDateString("fr-FR", {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} à {new Date(r.disponibilite.dateDebut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        Candidat: <span className="font-medium">{r.candidat?.prenom} {r.candidat?.nom}</span> ({r.candidat?.email})
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(r.status)}`}>
                          {r.status.replace("_", " ")}
                        </span>
                        {r.result && (
                          <span className="text-gray-500">
                            Résultat: <span className="font-medium">{r.result}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => router.push("/calendar")}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 focus:ring-4 focus:ring-gray-200 focus:outline-none transition-all duration-200 font-medium shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour au calendrier
        </button>
      </div>

      {/* Evaluation Modal */}
      {evaluationModalOpen && selectedReservation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Ajouter note d'entretien</h2>
                </div>
                <button
                  onClick={() => setEvaluationModalOpen(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-red-700 font-medium">
                      Candidat: <span className="font-semibold">{selectedReservation.candidat.prenom} {selectedReservation.candidat.nom}</span>
                    </p>
                    <p className="text-red-600 text-sm">
                      Spécialité: <span className="font-medium">{selectedReservation.candidat.specialite}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Evaluation form */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Français (sur 10)
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-white"
                      value={evalFields.francais}
                      onChange={(e)=>setEvalFields(v=>({...v, francais:e.target.value}))}
                    >
                      <option value="">Choisir une note</option>
                      {[...Array(11)].map((_,i)=> <option key={i} value={i}>{i}/10</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Anglais (sur 10)
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-white"
                      value={evalFields.anglais}
                      onChange={(e)=>setEvalFields(v=>({...v, anglais:e.target.value}))}
                    >
                      <option value="">Choisir une note</option>
                      {[...Array(11)].map((_,i)=> <option key={i} value={i}>{i}/10</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Motivation (sur 10)
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-white"
                      value={evalFields.motivation}
                      onChange={(e)=>setEvalFields(v=>({...v, motivation:e.target.value}))}
                    >
                      <option value="">Choisir une note</option>
                      {[...Array(11)].map((_,i)=> <option key={i} value={i}>{i}/10</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Culture Générale (sur 10)
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-white"
                      value={evalFields.cultureGenerale}
                      onChange={(e)=>setEvalFields(v=>({...v, cultureGenerale:e.target.value}))}
                    >
                      <option value="">Choisir une note</option>
                      {[...Array(11)].map((_,i)=> <option key={i} value={i}>{i}/10</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Bonus (sur 5)
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 bg-white"
                      value={evalFields.bonus}
                      onChange={(e)=>setEvalFields(v=>({...v, bonus:e.target.value}))}
                    >
                      <option value="">Choisir une note</option>
                      {[...Array(6)].map((_,i)=> <option key={i} value={i}>{i}/5</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Note sur 100
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200"
                      placeholder="Note finale /100"
                      min="0"
                      max="100"
                      value={evalFields.noteSur100}
                      onChange={(e)=>setEvalFields(v=>({...v, noteSur100:e.target.value}))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Observations
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 resize-none"
                    rows={4}
                    placeholder="Commentaires détaillés sur l'entretien, points forts, axes d'amélioration..."
                    value={evalFields.observation}
                    onChange={(e)=>setEvalFields(v=>({...v, observation:e.target.value}))}
                  />
                </div>
              </div>

              <div className="mb-8">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Compétence particulière
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: "CULTURE", label: "Culture", icon: "🎭" },
                      { key: "ART", label: "Art", icon: "🎨" },
                      { key: "EXPERIENCE_ONG", label: "Expérience ONG", icon: "🤝" },
                      { key: "SPORT", label: "Sport", icon: "⚽" },
                      { key: "AUCUNE", label: "Aucune activité", icon: "❌" },
                    ].map(opt => (
                      <label key={opt.key} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        evalFields.competence === opt.key
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="competence"
                          value={opt.key}
                          checked={evalFields.competence === opt.key}
                          onChange={(e)=>setEvalFields(v=>({...v, competence:e.target.value}))}
                          className="sr-only"
                        />
                        <span className="text-lg">{opt.icon}</span>
                        <span className="font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  💡 Vous pouvez enregistrer l'évaluation sans décider Accepter/Refuser maintenant.
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEvaluationModalOpen(false)}
                    className="px-6 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={async () => {
                      if (!selectedReservation) return;
                      const res = await fetch(`/api/reservation/${selectedReservation.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          francais: evalFields.francais ? Number(evalFields.francais) : null,
                          anglais: evalFields.anglais ? Number(evalFields.anglais) : null,
                          motivation: evalFields.motivation ? Number(evalFields.motivation) : null,
                          cultureGenerale: evalFields.cultureGenerale ? Number(evalFields.cultureGenerale) : null,
                          bonus: evalFields.bonus ? Number(evalFields.bonus) : null,
                          noteSur100: evalFields.noteSur100 ? Number(evalFields.noteSur100) : null,
                          observation: evalFields.observation || null,
                          competence: evalFields.competence || null,
                        })
                      });
                      if (res.ok) {
                        // Also mark reservation as TERMINEE
                        await fetch(`/api/reservation/${selectedReservation.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: 'TERMINEE', result: selectedResult || 'EN_ATTENTE' })
                        });
                        setEvaluationModalOpen(false);
                        fetchReservations();
                      } else {
                        const err = await res.json();
                        alert(`Erreur: ${err.error || 'Impossible d\'enregistrer'}`);
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 focus:ring-4 focus:ring-red-200 focus:outline-none transition-all duration-200 font-medium shadow-lg"
                  >
                    Enregistrer l'évaluation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meet Link Confirmation Modal */}
      {meetLinkModalOpen && reservationToConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!reservationToConfirm) return;
                setUpdating(reservationToConfirm.id);
                try {
                  const response = await fetch(`/api/reservation/${reservationToConfirm.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: statusToSet, meetLink: meetLinkInput }),
                  });
                  if (response.ok) {
                    alert("Statut mis à jour avec succès !");
                    fetchReservations();
                    setMeetLinkModalOpen(false);
                    setReservationToConfirm(null);
                    setStatusToSet("");
                  } else {
                    const error = await response.json();
                    alert(`❌ ${error.error}`);
                  }
                } catch (error) {
                  alert("❌ Erreur lors de la mise à jour du statut");
                } finally {
                  setUpdating(null);
                }
              }}
              className="p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Changer le statut de la réservation</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lien de réunion
                  </label>
                  <input
                    type="url"
                    required
                    value={meetLinkInput}
                    onChange={e => setMeetLinkInput(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => { setMeetLinkModalOpen(false); setStatusToSet(""); }}
                  className="px-6 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updating === reservationToConfirm.id}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-green-200 focus:outline-none transition-all duration-200 font-medium shadow-lg"
                >
                  {updating === reservationToConfirm.id ? "Mise à jour..." : "Valider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}