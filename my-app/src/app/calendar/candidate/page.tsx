"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

interface Disponibilite {
  id: string;
  dateDebut: string;
  dateFin: string;
  id_Enseignant: string;
  enseignant: {
    id: string;
    nom: string;
    prenom: string;
    specialite: string;
  };
  reservations: {
    id: string;
    status: "EN_ATTENTE" | "CONFIRMEE" | "ANNULEE";
    id_Candidat: string;
  }[];
}

export default function CandidateCalendar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [disponibilites, setDisponibilites] = useState<Disponibilite[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Disponibilite[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Check if user is Candidat
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/Auth/Signin");
      return;
    }

    if (session.user.role !== "Candidat") {
      router.push("/welcome");
      return;
    }

    fetchDisponibilites();
  }, [session, status, router]);

  const fetchDisponibilites = async () => {
    try {
      console.log("Fetching disponibilites...");
      const response = await fetch("/api/disponibilite/public");
      if (response.ok) {
        const data = await response.json();
        console.log("Disponibilites loaded:", data);
        setDisponibilites(data);
      } else {
        console.error("Erreur API:", response.status);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des disponibilités:", error);
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

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getDisponibilitesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return disponibilites.filter(dispo => {
      const dispoDate = new Date(dispo.dateDebut).toISOString().split('T')[0];
      return dispoDate === dateStr;
    });
  };

  const getStatusColor = (disponibilite: Disponibilite) => {
    const hasReservation = disponibilite.reservations.length > 0;
    const isMyReservation = disponibilite.reservations.some(res => res.id_Candidat === session?.user.id);
    
    if (isMyReservation) {
      return "bg-green-100 border-green-300 text-green-800";
    }
    if (hasReservation) {
      return "bg-red-100 border-red-300 text-red-800";
    }
    return "bg-blue-100 border-blue-300 text-blue-800";
  };

  const getStatusText = (disponibilite: Disponibilite) => {
    const hasReservation = disponibilite.reservations.length > 0;
    const isMyReservation = disponibilite.reservations.some(res => res.id_Candidat === session?.user.id);
    
    if (isMyReservation) {
      return "Votre réservation";
    }
    if (hasReservation) {
      return "Réservé";
    }
    return "Disponible";
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const slots = getDisponibilitesForDate(date);
    setSelectedSlots(slots);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleReservation = async (disponibiliteId: string) => {
    try {
      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_Disponibilite: disponibiliteId,
        }),
      });

      if (response.ok) {
        alert("✅ Réservation créée avec succès!");
        fetchDisponibilites();
        setSelectedSlots([]);
      } else {
        const error = await response.json();
        alert(`❌ ${error.error}`);
      }
    } catch (error) {
      alert("❌ Erreur lors de la réservation");
    }
  };

  const handleCancelReservation = async (disponibiliteId: string) => {
    try {
      const reservation = disponibilites
        .find(d => d.id === disponibiliteId)
        ?.reservations.find(r => r.id_Candidat === session?.user.id);

      if (!reservation) return;

      const response = await fetch(`/api/reservation/${reservation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "ANNULEE",
        }),
      });

      if (response.ok) {
        alert("✅ Réservation annulée avec succès!");
        fetchDisponibilites();
        setSelectedSlots([]);
      } else {
        const error = await response.json();
        alert(`❌ ${error.error}`);
      }
    } catch (error) {
      alert("❌ Erreur lors de l'annulation");
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  console.log("Current disponibilites:", disponibilites);
  console.log("Current session:", session);

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Calendrier des disponibilités</h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/interviews")}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
              >
                📋 Voir les entretiens
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
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              <h2 className="text-xl font-semibold capitalize">{monthName}</h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                →
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
            >
              Aujourd'hui
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
              <div key={day} className="p-3 text-center font-medium text-gray-500 text-sm">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="p-3 bg-gray-50"></div>;
              }
              const dayDisponibilites = getDisponibilitesForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = selectedDate?.toDateString() === day.toDateString();
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`p-3 min-h-[100px] border cursor-pointer transition-colors ${
                    isToday
                      ? "bg-blue-50 border-blue-200"
                      : isSelected
                      ? "bg-primary/10 border-primary"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-sm font-medium mb-2">
                    {day.getDate()}
                    {isToday && (
                      <span className="ml-1 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  {/* Only show up to 2 dots and a +X badge, no text or list! */}
                  <div className="flex flex-wrap gap-1">
                    {dayDisponibilites.slice(0, 2).map((dispo) => (
                      <span
                        key={dispo.id}
                        className={`inline-block w-4 h-4 rounded-full border-2 ${getStatusColor(dispo)} border-opacity-80`}
                        title={formatTime(dispo.dateDebut) + ' - ' + getStatusText(dispo)}
                      ></span>
                    ))}
                    {dayDisponibilites.length > 2 && (
                      <span className="inline-block text-xs bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 align-middle">
                        +{dayDisponibilites.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal for selected date details */}
        {modalOpen && selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                aria-label="Fermer"
              >
                &times;
              </button>
              <h3 className="text-lg font-semibold mb-4">
                Disponibilités du {formatDate(selectedDate)}
              </h3>
              {selectedSlots.length === 0 ? (
                <p className="text-gray-500">Aucune disponibilité pour cette date.</p>
              ) : (
                <div className="grid gap-4">
                  {selectedSlots.map((slot) => {
                    const isMyReservation = slot.reservations.some(res => res.id_Candidat === session?.user.id);
                    const hasReservation = slot.reservations.length > 0;
                    const canReserve = !hasReservation;
                    return (
                      <div
                        key={slot.id}
                        className={`p-4 rounded-lg border ${
                          isMyReservation
                            ? "bg-green-50 border-green-200"
                            : hasReservation
                            ? "bg-red-50 border-red-200"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {formatTime(slot.dateDebut)} - {formatTime(slot.dateFin)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {slot.enseignant.prenom} {slot.enseignant.nom} ({slot.enseignant.specialite})
                            </p>
                            <p className="text-sm font-medium">
                              {getStatusText(slot)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {isMyReservation ? (
                              <button
                                onClick={() => handleCancelReservation(slot.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                              >
                                Annuler
                              </button>
                            ) : canReserve ? (
                              <button
                                onClick={() => handleReservation(slot.id)}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 text-sm"
                              >
                                Réserver
                              </button>
                            ) : (
                              <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg text-sm">
                                Réservé
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 