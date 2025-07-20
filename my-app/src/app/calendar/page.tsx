"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Disponibilite {
  id: string;
  dateDebut: string;
  dateFin: string;
  reservations: Array<{
    id: string;
    candidat: {
      nom: string;
      prenom: string;
      email: string;
      specialite: string;
    };
    status: string;
    result?: string;
  }>;
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [disponibilites, setDisponibilites] = useState<Disponibilite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);
  // For managing interview results
  const [managingResult, setManagingResult] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/Auth/Signin");
    } else if (status === "authenticated" && session?.user?.role !== "ENSEIGNANT") {
      router.push("/welcome");
    } else if (session?.user?.role === "ENSEIGNANT") {
      fetchDisponibilites();
    }
  }, [status, session, router]);

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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDisponibilitesForDay = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return disponibilites.filter(disponibilite => {
      const disponibiliteDate = new Date(disponibilite.dateDebut);
      return disponibiliteDate >= startOfDay && disponibiliteDate <= endOfDay;
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

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setShowDayDetails(true);
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
        alert(`✅ Entretien marqué comme terminé avec le résultat: ${result === "ACCEPTER" ? "Accepté" : "Refusé"}`);
        fetchDisponibilites(); // Refresh data
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

  const openResultModal = (reservation: any) => {
    setSelectedReservation(reservation);
    setSelectedResult("");
    setResultModalOpen(true);
  };

  const getResultDisplay = (reservation: any) => {
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

  const getResultAction = (reservation: any) => {
    if (reservation.status === "TERMINEE") {
      return getResultDisplay(reservation);
    } else if (reservation.status === "CONFIRMEE") {
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "ENSEIGNANT") {
    return null;
  }

  const selectedDayDisponibilites = selectedDate ? getDisponibilitesForDay(selectedDate.getDate()) : [];

  const renderCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-gray-200 bg-gray-50"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === new Date().getDate() && 
                     currentDate.getMonth() === new Date().getMonth() && 
                     currentDate.getFullYear() === new Date().getFullYear();
      
      const dayDisponibilites = getDisponibilitesForDay(day);
      const hasReservations = dayDisponibilites.some(d => d.reservations.length > 0);
      const hasAvailableSlots = dayDisponibilites.some(d => d.reservations.length === 0);
      
      days.push(
        <div 
          key={day} 
          onClick={() => handleDayClick(day)}
          className={`h-32 border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-100 border-blue-300' : ''
          } ${hasReservations ? 'bg-green-50 border-green-300' : ''} ${hasAvailableSlots ? 'bg-yellow-50 border-yellow-300' : ''}`}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="text-xs text-gray-500 mt-1 space-y-1">
            {dayDisponibilites.map((disponibilite, index) => (
              <div key={disponibilite.id} className="text-xs">
                <div className="font-medium">
                  {formatTime(disponibilite.dateDebut)} - {formatTime(disponibilite.dateFin)}
                </div>
                {disponibilite.reservations.length > 0 ? (
                  <div className="text-green-600">
                    ✓ Réservé ({disponibilite.reservations.length})
                  </div>
                ) : (
                  <div className="text-yellow-600">
                    ○ Disponible
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Calendrier - {session.user?.name}
              </h1>
              <p className="text-gray-600">
                Gérez vos disponibilités et consultez vos entretiens
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/welcome")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Retour
              </button>
            </div>
          </div>

          {/* Calendar Legend */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Légende:</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Aujourd'hui</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-50 border border-yellow-300 rounded"></div>
                <span>Créneaux disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
                <span>Entretiens réservés</span>
              </div>
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={goToPreviousMonth}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Précédent
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={goToToday}
                className="text-sm text-primary hover:underline mt-1"
              >
                Aujourd'hui
              </button>
            </div>
            
            <button
              onClick={goToNextMonth}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Suivant →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {dayNames.map((day) => (
              <div key={day} className="h-12 flex items-center justify-center bg-gray-100 border border-gray-200 font-medium text-gray-700">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {renderCalendarDays()}
          </div>

          {/* Calendar Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📅 Gérer Disponibilités</h3>
              <p className="text-blue-700 text-sm">
                Créez et gérez vos créneaux disponibles pour les entretiens
              </p>
              <button
                onClick={() => router.push("/calendar/manage")}
                className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Gérer
              </button>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">👥 Entretiens Réservés</h3>
              <p className="text-green-700 text-sm">
                Consultez vos entretiens d'admission réservés
              </p>
              <button
                onClick={() => router.push("/calendar/reservations")}
                className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                Voir
              </button>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">📊 Statistiques</h3>
              <p className="text-purple-700 text-sm">
                Consultez les statistiques de vos entretiens
              </p>
              <button
                onClick={() => router.push("/calendar/stats")}
                className="mt-2 px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
              >
                Voir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      {showDayDetails && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedDate.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                <button
                  onClick={() => setShowDayDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {selectedDayDisponibilites.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune disponibilité pour cette journée
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setShowDayDetails(false);
                        router.push("/calendar/manage");
                      }}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
                    >
                      Créer une disponibilité
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDayDisponibilites.map((disponibilite) => (
                    <div key={disponibilite.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">
                            {formatTime(disponibilite.dateDebut)} - {formatTime(disponibilite.dateFin)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Durée: {Math.round((new Date(disponibilite.dateFin).getTime() - new Date(disponibilite.dateDebut).getTime()) / (1000 * 60))} minutes
                          </p>
                        </div>
                        <div className="text-right">
                          {disponibilite.reservations.length > 0 ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              Réservé
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                              Disponible
                            </span>
                          )}
                        </div>
                      </div>

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
                                  {getResultAction(reservation)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
