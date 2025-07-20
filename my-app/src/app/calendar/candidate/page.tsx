"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

export default function CandidateCalendar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<string>("09:00");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // Reservation management
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [myReservations, setMyReservations] = useState<any[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  // For calendar dots
  const [activeReservations, setActiveReservations] = useState<any[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  // For update modal
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [reservationToUpdate, setReservationToUpdate] = useState<any | null>(null);
  const [updateDate, setUpdateDate] = useState<Date | null>(null);
  const [updateHour, setUpdateHour] = useState<string>("09:00");
  const [updating, setUpdating] = useState(false);
  // For accepting results
  const [acceptingResult, setAcceptingResult] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/Auth/Signin");
      return;
    }
    // Type guard for user role
    const userHasRole = (user: any): user is { role: string } => !!user && typeof user.role === 'string';
    if (!userHasRole(session.user) || session.user.role !== "CANDIDAT") {
      router.push("/welcome");
      return;
    }
    // Fetch active reservations for calendar dots
    fetchActiveReservations();
  }, [session, status, router]);

  const fetchActiveReservations = async () => {
    try {
      const res = await fetch("/api/reservation?mine=1");
      if (res.ok) {
        const data = await res.json();
        // Only keep EN_ATTENTE or CONFIRMEE
        setActiveReservations((data.reservations || []).filter((r: any) => ["EN_ATTENTE", "CONFIRMEE"].includes(r.status)));
      }
    } catch (e) {
      setActiveReservations([]);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDay = new Date(date);
    clickedDay.setHours(0, 0, 0, 0);
    if (clickedDay < today) return; // Prevent past days
    const reservation = getReservationForDay(date);
    if (reservation) {
      setSelectedReservation(reservation);
      setModalOpen(true);
      return;
    }
    setSelectedDate(date);
    setSelectedHour("09:00");
    setSelectedReservation(null);
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setSelectedReservation(null); };

  const handleReservation = async () => {
    if (!selectedDate || !selectedHour) return;
    setLoading(true);
    try {
      const date = new Date(selectedDate);
      const [hour, minute] = selectedHour.split(":").map(Number);
      date.setHours(hour, minute, 0, 0);
      const isoDate = date.toISOString();
      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateTime: isoDate }),
      });
      if (response.ok) {
        alert("✅ Entretien réservé avec succès! Un enseignant vous sera assigné.");
        closeModal();
      } else {
        const error = await response.json();
        alert(`❌ ${error.error}`);
      }
    } catch (error) {
      alert("❌ Erreur lors de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  // Generate hour options (08:00 to 18:00), filter for today
  const hourOptions = Array.from({ length: 11 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, "0")}:00`;
  }).filter(hourStr => {
    if (!selectedDate) return true;
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    if (!isToday) return true;
    // Only allow future hours for today
    const [hourPart] = hourStr.split(":");
    return parseInt(hourPart) > today.getHours();
  });

  const fetchMyReservations = async () => {
    setLoadingReservations(true);
    try {
      const res = await fetch("/api/reservation?mine=1");
      if (res.ok) {
        const data = await res.json();
        setMyReservations(data.reservations || []);
      }
    } catch (e) {
      setMyReservations([]);
    } finally {
      setLoadingReservations(false);
    }
  };

  const openManageModal = () => {
    fetchMyReservations();
    setManageModalOpen(true);
  };
  const closeManageModal = () => setManageModalOpen(false);

  const handleCancelReservation = async (reservationId: string) => {
    if (!window.confirm("Voulez-vous vraiment annuler cette réservation ?")) return;
    try {
      const res = await fetch(`/api/reservation/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ANNULEE" }),
      });
      if (res.ok) {
        setMyReservations((prev) => prev.filter(r => r.id !== reservationId));
        alert("Réservation annulée.");
      } else {
        alert("Erreur lors de l'annulation.");
      }
    } catch (e) {
      alert("Erreur lors de l'annulation.");
    }
  };

  const openUpdateModal = (reservation: any) => {
    setReservationToUpdate(reservation);
    setUpdateDate(new Date(reservation.disponibilite?.dateDebut));
    setUpdateHour(new Date(reservation.disponibilite?.dateDebut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", hour12: false }));
    setUpdateModalOpen(true);
  };
  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setReservationToUpdate(null);
  };

  const handleUpdateReservation = async () => {
    if (!reservationToUpdate || !updateDate || !updateHour) return;
    setUpdating(true);
    try {
      // 1. Cancel old reservation
      await fetch(`/api/reservation/${reservationToUpdate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ANNULEE" }),
      });
      // Wait for backend to update (ensure no active reservation)
      await new Promise(res => setTimeout(res, 400));
      await fetchActiveReservations();
      // 2. Create new reservation
      const date = new Date(updateDate);
      const [hour, minute] = updateHour.split(":").map(Number);
      date.setHours(hour, minute, 0, 0);
      const isoDate = date.toISOString();
      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateTime: isoDate }),
      });
      if (response.ok) {
        alert("Réservation modifiée avec succès!");
        closeUpdateModal();
        closeManageModal();
      } else {
        const error = await response.json();
        alert(`❌ ${error.error}`);
      }
    } catch (e) {
      alert("Erreur lors de la modification.");
    } finally {
      setUpdating(false);
    }
  };

  const handleAcceptResult = async (reservationId: string) => {
    if (!window.confirm("Voulez-vous accepter ce résultat ? Votre rôle sera changé en ETUDIANT.")) return;
    
    setAcceptingResult(true);
    try {
      const res = await fetch(`/api/reservation/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: "ACCEPTER" }),
      });
      
      if (res.ok) {
        alert("✅ Résultat accepté ! Votre rôle a été changé en ETUDIANT. Vous allez être déconnecté pour rafraîchir votre session.");
        // Force sign out to refresh session
        await fetch('/api/auth/signout', { method: 'POST' });
        router.push('/Auth/Signin');
      } else {
        const error = await res.json();
        alert(`❌ ${error.error}`);
      }
    } catch (e) {
      alert("Erreur lors de l'acceptation du résultat.");
    } finally {
      setAcceptingResult(false);
    }
  };

  const getReservationForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return activeReservations.find((r) => {
      const resDate = new Date(r.disponibilite?.dateDebut).toISOString().split('T')[0];
      return resDate === dateStr;
    });
  };

  const getResultDisplay = (reservation: any) => {
    if (reservation.status !== "TERMINEE") return null;
    
    if (reservation.result === "ACCEPTER") {
      return (
        <div className="text-sm text-green-600 font-medium">
          ✅ Résultat: Accepté
        </div>
      );
    } else if (reservation.result === "REFUSER") {
      return (
        <div className="text-sm text-red-600 font-medium">
          ❌ Résultat: Refusé
        </div>
      );
    } else {
      return (
        <div className="text-sm text-orange-600 font-medium">
          ⏳ En attente de votre réponse
        </div>
      );
    }
  };

  const getResultAction = (reservation: any) => {
    if (reservation.status !== "TERMINEE") return null;
    
    // If enseignant accepted, show success message (no action needed)
    if (reservation.result === "ACCEPTER") {
      return (
        <div className="text-sm text-green-600 font-medium">
          ✅ Vous avez été accepté ! Votre rôle a été mis à jour en ETUDIANT.
        </div>
      );
    }
    
    // If enseignant refused, candidate can still accept to become ETUDIANT
    if (reservation.result === "REFUSER") {
      return (
        <button
          onClick={() => handleAcceptResult(reservation.id)}
          disabled={acceptingResult}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
        >
          {acceptingResult ? "Acceptation..." : "Accepter le résultat"}
        </button>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Réserver un entretien</h1>
            <div className="flex gap-2">
              <button
                onClick={openManageModal}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Gérer ma réservation
              </button>
              <button
                onClick={() => router.push("/welcome")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                🏠 Accueil
              </button>
            </div>
          </div>
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={goToPreviousMonth} className="p-2 hover:bg-gray-100 rounded-lg">←</button>
              <h2 className="text-xl font-semibold capitalize">{monthName}</h2>
              <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">→</button>
            </div>
            <button onClick={goToToday} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90">Aujourd'hui</button>
          </div>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
              <div key={day} className="p-3 text-center font-medium text-gray-500 text-sm">{day}</div>
            ))}
            {days.map((day, index) => {
              if (!day) return <div key={index} className="p-3 bg-gray-50"></div>;
              const isToday = day.toDateString() === new Date().toDateString();
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPast = day < today;
              const reservation = getReservationForDay(day);
              return (
                <div
                  key={index}
                  onClick={() => !isPast && handleDateClick(day)}
                  className={`p-3 min-h-[100px] border cursor-pointer transition-colors ${
                    isPast ? "bg-gray-100 text-gray-400 cursor-not-allowed" : isToday ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-sm font-medium mb-2">
                    {day.getDate()}
                    {isToday && (
                      <span className="ml-1 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  {/* Show green dot if reservation exists for this day */}
                  {reservation && (
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-green-600 bg-green-400 mt-1" title="Vous avez une réservation"></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Modal for picking hour and confirming reservation or showing reservation details */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full relative">
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                aria-label="Fermer"
              >
                &times;
              </button>
              {selectedReservation ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">Votre réservation</h3>
                  <div className="mb-2">Date : {new Date(selectedReservation.disponibilite?.dateDebut).toLocaleDateString("fr-FR")}</div>
                  <div className="mb-2">Heure : {new Date(selectedReservation.disponibilite?.dateDebut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                  <div className="mb-2">Enseignant : {selectedReservation.disponibilite?.enseignant?.prenom} {selectedReservation.disponibilite?.enseignant?.nom}</div>
                  <div className="mb-2">Statut : {selectedReservation.status}</div>
                  {getResultDisplay(selectedReservation)}
                  {getResultAction(selectedReservation)}
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-4">Choisir l'heure pour le {selectedDate && formatDate(selectedDate)}</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Heure</label>
                    <select
                      value={selectedHour}
                      onChange={e => setSelectedHour(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {hourOptions.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleReservation}
                    disabled={loading}
                    className="w-full bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {loading ? "Réservation..." : "Confirmer la réservation"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {/* Modal for managing reservations */}
        {manageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
              <button
                onClick={closeManageModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                aria-label="Fermer"
              >
                &times;
              </button>
              <h3 className="text-lg font-semibold mb-4">Ma réservation</h3>
              {loadingReservations ? (
                <div className="text-center text-gray-500">Chargement...</div>
              ) : myReservations.length === 0 ? (
                <div className="text-center text-gray-500">Aucune réservation trouvée.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {myReservations.map((r) => (
                    <li key={r.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {new Date(r.disponibilite?.dateDebut).toLocaleDateString("fr-FR")} {new Date(r.disponibilite?.dateDebut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="text-sm text-gray-600">
                          Enseignant: {r.disponibilite?.enseignant?.prenom} {r.disponibilite?.enseignant?.nom}
                        </div>
                        <div className="text-xs text-gray-500">Statut: {r.status}</div>
                        {getResultDisplay(r)}
                      </div>
                      <div className="flex flex-col gap-2">
                        {getResultAction(r)}
                        {r.status !== "TERMINEE" && (
                          <>
                            <button
                              onClick={() => handleCancelReservation(r.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            >
                              Supprimer
                            </button>
                            <button
                              onClick={() => openUpdateModal(r)}
                              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                            >
                              Modifier
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        {/* Update reservation modal */}
        {updateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full relative">
              <button
                onClick={closeUpdateModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                aria-label="Fermer"
              >
                &times;
              </button>
              <h3 className="text-lg font-semibold mb-4">Modifier la réservation</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={updateDate ? updateDate.toISOString().split('T')[0] : ""}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setUpdateDate(new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Heure</label>
                <select
                  value={updateHour}
                  onChange={e => setUpdateHour(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {hourOptions.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleUpdateReservation}
                disabled={updating}
                className="w-full bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50"
              >
                {updating ? "Modification..." : "Confirmer la modification"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 