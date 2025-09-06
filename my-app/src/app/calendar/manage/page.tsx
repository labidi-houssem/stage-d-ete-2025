"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

export default function ManageDisponibilite() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [disponibilites, setDisponibilites] = useState<Disponibilite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    duration: 60, // minutes
    numberOfSlots: 1,
  });
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkData, setBulkData] = useState({
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "10:00",
    duration: 60,
    numberOfSlots: 1,
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
  });

  // Check if user is Enseignant
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user?.role !== "ENSEIGNANT") {
      router.push("/calendar");
      return;
    }

    fetchDisponibilites();
  }, [session, status, router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Generate multiple time slots based on form data
      const slots = generateTimeSlots();
      
      // Create all slots
      const promises = slots.map(slot => 
        fetch("/api/disponibilite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(slot),
        })
      );

      const responses = await Promise.all(promises);
      const failedResponses = responses.filter(response => !response.ok);
      
      if (failedResponses.length === 0) {
        alert(`✅ ${slots.length} disponibilité(s) créée(s) avec succès!`);
        setFormData({
          date: "",
          startTime: "09:00",
          endTime: "10:00",
          duration: 60,
          numberOfSlots: 1,
        });
        fetchDisponibilites();
      } else {
        const error = await failedResponses[0].json();
        alert(`❌ ${error.error}`);
      }
    } catch (error) {
      alert("❌ Erreur lors de la création des disponibilités");
    } finally {
      setCreating(false);
    }
  };

  const generateTimeSlots = () => {
    const slots: { dateDebut: string; dateFin: string }[] = [];
    const { date, startTime, endTime, duration, numberOfSlots } = formData;
    
    if (!date || !startTime || !endTime) return slots;

    const baseDate = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(baseDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    const endDateTime = new Date(baseDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    
    const totalDuration = endDateTime.getTime() - startDateTime.getTime();
    const slotDuration = duration * 60 * 1000; // Convert to milliseconds
    
    // Calculate how many slots can fit in the time range
    const maxSlots = Math.floor(totalDuration / slotDuration);
    const actualSlots = Math.min(numberOfSlots, maxSlots);
    
    for (let i = 0; i < actualSlots; i++) {
      const slotStart = new Date(startDateTime.getTime() + (i * slotDuration));
      const slotEnd = new Date(slotStart.getTime() + slotDuration);
      
      slots.push({
        dateDebut: slotStart.toISOString(),
        dateFin: slotEnd.toISOString(),
      });
    }
    
    return slots;
  };

  const getTimeSlotPreview = () => {
    const slots = generateTimeSlots();
    return slots;
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const allSlots = generateBulkTimeSlots();
      
      if (allSlots.length === 0) {
        alert("❌ Aucun créneau possible avec ces paramètres");
        return;
      }

      // Create all slots
      const promises = allSlots.map(slot => 
        fetch("/api/disponibilite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(slot),
        })
      );

      const responses = await Promise.all(promises);
      const failedResponses = responses.filter(response => !response.ok);
      
      if (failedResponses.length === 0) {
        alert(`✅ ${allSlots.length} disponibilité(s) créée(s) avec succès!`);
        setBulkData({
          startDate: "",
          endDate: "",
          startTime: "09:00",
          endTime: "10:00",
          duration: 60,
          numberOfSlots: 1,
          daysOfWeek: [1, 2, 3, 4, 5],
        });
        fetchDisponibilites();
      } else {
        const error = await failedResponses[0].json();
        alert(`❌ ${error.error}`);
      }
    } catch (error) {
      alert("❌ Erreur lors de la création des disponibilités");
    } finally {
      setCreating(false);
    }
  };

  const generateBulkTimeSlots = () => {
    const slots: { dateDebut: string; dateFin: string }[] = [];
    const { startDate, endDate, startTime, endTime, duration, numberOfSlots, daysOfWeek } = bulkData;
    
    if (!startDate || !endDate || !startTime || !endTime) return slots;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      // Convert Sunday (0) to 7 for easier comparison
      const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
      
      if (daysOfWeek.includes(adjustedDayOfWeek)) {
        const baseDate = new Date(date);
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        const startDateTime = new Date(baseDate);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        
        const endDateTime = new Date(baseDate);
        endDateTime.setHours(endHour, endMinute, 0, 0);
        
        const totalDuration = endDateTime.getTime() - startDateTime.getTime();
        const slotDuration = duration * 60 * 1000;
        
        const maxSlots = Math.floor(totalDuration / slotDuration);
        const actualSlots = Math.min(numberOfSlots, maxSlots);
        
        for (let i = 0; i < actualSlots; i++) {
          const slotStart = new Date(startDateTime.getTime() + (i * slotDuration));
          const slotEnd = new Date(slotStart.getTime() + slotDuration);
          
          slots.push({
            dateDebut: slotStart.toISOString(),
            dateFin: slotEnd.toISOString(),
          });
        }
      }
    }
    
    return slots;
  };

  const getBulkPreview = () => {
    return generateBulkTimeSlots();
  };

  const toggleDayOfWeek = (day: number) => {
    setBulkData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort()
    }));
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gérer mes disponibilités
        </h1>
        <p className="text-gray-600">
          Créez et gérez vos créneaux disponibles pour les entretiens d'admission
        </p>
      </div>

      {/* Create New Disponibilité Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Créer des disponibilités</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de début
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de fin
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Duration and Number of Slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée de chaque créneau (minutes)
              </label>
              <select
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 heure</option>
                <option value={90}>1 heure 30</option>
                <option value={120}>2 heures</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de créneaux
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.numberOfSlots}
                onChange={(e) =>
                  setFormData({ ...formData, numberOfSlots: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum possible: {formData.date && formData.startTime && formData.endTime ? 
                  Math.floor((new Date(`2000-01-01T${formData.endTime}`).getTime() - new Date(`2000-01-01T${formData.startTime}`).getTime()) / (formData.duration * 60 * 1000)) : 0}
              </p>
            </div>
          </div>

          {/* Preview */}
          {formData.date && formData.startTime && formData.endTime && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Aperçu des créneaux:</h3>
              <div className="space-y-2">
                {getTimeSlotPreview().map((slot, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    Créneau {index + 1}: {new Date(slot.dateDebut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} - {new Date(slot.dateFin).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                ))}
                {getTimeSlotPreview().length === 0 && (
                  <p className="text-red-500 text-sm">Aucun créneau possible avec ces paramètres</p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={creating || getTimeSlotPreview().length === 0}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50"
          >
            {creating ? "Création..." : `Créer ${getTimeSlotPreview().length} disponibilité(s)`}
          </button>
        </form>
      </div>

      {/* Mode Toggle */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setBulkMode(false)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !bulkMode
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Création simple
          </button>
          <button
            onClick={() => setBulkMode(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              bulkMode
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Création en masse
          </button>
        </div>

        {!bulkMode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setFormData({
                  date: today,
                  startTime: "09:00",
                  endTime: "12:00",
                  duration: 60,
                  numberOfSlots: 3,
                });
              }}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <h3 className="font-medium text-gray-900">Matin (3h)</h3>
              <p className="text-sm text-gray-600">9h00 - 12h00 (3 créneaux de 1h)</p>
            </button>
            
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setFormData({
                  date: today,
                  startTime: "14:00",
                  endTime: "17:00",
                  duration: 60,
                  numberOfSlots: 3,
                });
              }}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <h3 className="font-medium text-gray-900">Après-midi (3h)</h3>
              <p className="text-sm text-gray-600">14h00 - 17h00 (3 créneaux de 1h)</p>
            </button>
            
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setFormData({
                  date: today,
                  startTime: "09:00",
                  endTime: "17:00",
                  duration: 60,
                  numberOfSlots: 8,
                });
              }}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <h3 className="font-medium text-gray-900">Journée complète</h3>
              <p className="text-sm text-gray-600">9h00 - 17h00 (8 créneaux de 1h)</p>
            </button>
          </div>
        )}
      </div>

      {/* Bulk Creation Form */}
      {bulkMode && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Créer des disponibilités en masse</h2>
          <form onSubmit={handleBulkSubmit} className="space-y-6">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  required
                  value={bulkData.startDate}
                  onChange={(e) =>
                    setBulkData({ ...bulkData, startDate: e.target.value })
                  }
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  required
                  value={bulkData.endDate}
                  onChange={(e) =>
                    setBulkData({ ...bulkData, endDate: e.target.value })
                  }
                  min={bulkData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de début
                </label>
                <input
                  type="time"
                  required
                  value={bulkData.startTime}
                  onChange={(e) =>
                    setBulkData({ ...bulkData, startTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de fin
                </label>
                <input
                  type="time"
                  required
                  value={bulkData.endTime}
                  onChange={(e) =>
                    setBulkData({ ...bulkData, endTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Duration and Number of Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée de chaque créneau (minutes)
                </label>
                <select
                  value={bulkData.duration}
                  onChange={(e) =>
                    setBulkData({ ...bulkData, duration: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 heure</option>
                  <option value={90}>1 heure 30</option>
                  <option value={120}>2 heures</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de créneaux par jour
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={bulkData.numberOfSlots}
                  onChange={(e) =>
                    setBulkData({ ...bulkData, numberOfSlots: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Days of Week */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jours de la semaine
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { day: 1, name: "Lun" },
                  { day: 2, name: "Mar" },
                  { day: 3, name: "Mer" },
                  { day: 4, name: "Jeu" },
                  { day: 5, name: "Ven" },
                  { day: 6, name: "Sam" },
                  { day: 7, name: "Dim" },
                ].map(({ day, name }) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDayOfWeek(day)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      bulkData.daysOfWeek.includes(day)
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {bulkData.startDate && bulkData.endDate && bulkData.startTime && bulkData.endTime && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Aperçu des créneaux:</h3>
                <div className="text-sm text-gray-600">
                  <p>Total: {getBulkPreview().length} créneaux</p>
                  <p>Jours sélectionnés: {bulkData.daysOfWeek.length} jours</p>
                  <p>Période: {new Date(bulkData.startDate).toLocaleDateString("fr-FR")} - {new Date(bulkData.endDate).toLocaleDateString("fr-FR")}</p>
                </div>
                {getBulkPreview().length === 0 && (
                  <p className="text-red-500 text-sm mt-2">Aucun créneau possible avec ces paramètres</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={creating || getBulkPreview().length === 0}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50"
            >
              {creating ? "Création..." : `Créer ${getBulkPreview().length} disponibilité(s)`}
            </button>
          </form>
        </div>
      )}

      {/* Disponibilités List */}
      {/* Removed Mes disponibilités list from here as requested */}
    </div>
  );
} 