"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Disponibilite {
  id: string;
  dateDebut: string;
  dateFin: string;
  enseignant: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
}

export default function InterviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [disponibilites, setDisponibilites] = useState<Disponibilite[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEnseignant, setSelectedEnseignant] = useState("");

  // Check if user is Candidat
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/welcome");
      return;
    }
    if (session.user?.role === "CANDIDAT") {
      router.push("/calendar/candidate");
      return;
    }

    fetchAvailableDisponibilites();
  }, [session, status, router, selectedDate, selectedEnseignant]);

  const fetchAvailableDisponibilites = async () => {
    try {
      let url = "/api/reservation";
      const params = new URLSearchParams();
      
      if (selectedDate) {
        params.append("date", selectedDate);
      }
      if (selectedEnseignant) {
        params.append("enseignantId", selectedEnseignant);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
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

  const handleBookInterview = async (disponibiliteId: string) => {
    setBooking(disponibiliteId);

    try {
      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_Disponibilite: disponibiliteId }),
      });

      if (response.ok) {
        alert("✅ Entretien réservé avec succès! Vous recevrez une confirmation par email.");
        fetchAvailableDisponibilites();
      } else {
        const error = await response.json();
        alert(`❌ ${error.error}`);
      }
    } catch (error) {
      alert("❌ Erreur lors de la réservation");
    } finally {
      setBooking(null);
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Réserver un entretien d'admission
            </h1>
            <p className="text-gray-600">
              Consultez les créneaux disponibles et réservez votre entretien
            </p>
          </div>
          <button
            onClick={() => router.push("/calendar/candidate")}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            📅 Voir le calendrier
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enseignant (optionnel)
            </label>
            <input
              type="text"
              placeholder="Rechercher par nom d'enseignant"
              value={selectedEnseignant}
              onChange={(e) => setSelectedEnseignant(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Available Slots */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            Créneaux disponibles ({disponibilites.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {disponibilites.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {selectedDate || selectedEnseignant 
                ? "Aucun créneau disponible avec ces critères" 
                : "Aucun créneau disponible pour le moment"
              }
            </div>
          ) : (
            disponibilites.map((disponibilite) => (
              <div key={disponibilite.id} className="px-6 py-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <div className="text-blue-900 font-semibold">
                          {formatDate(disponibilite.dateDebut)}
                        </div>
                        <div className="text-blue-700 text-sm">
                          {formatTime(disponibilite.dateDebut)} - {formatTime(disponibilite.dateFin)}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {disponibilite.enseignant.nom} {disponibilite.enseignant.prenom}
                        </h3>
                        <p className="text-gray-600">
                          {disponibilite.enseignant.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Durée: {Math.round((new Date(disponibilite.dateFin).getTime() - new Date(disponibilite.dateDebut).getTime()) / (1000 * 60))} minutes
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button
                      onClick={() => handleBookInterview(disponibilite.id)}
                      disabled={booking === disponibilite.id}
                      className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {booking === disponibilite.id ? "Réservation..." : "Réserver"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Information */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informations importantes</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Vous ne pouvez réserver qu'un seul entretien à la fois</li>
          <li>• L'entretien sera confirmé par l'enseignant</li>
          <li>• Vous recevrez une notification par email</li>
          <li>• Préparez vos documents d'admission</li>
        </ul>
      </div>
    </div>
  );
} 