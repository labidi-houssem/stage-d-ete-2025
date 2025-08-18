"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

interface Disponibilite {
  id: string;
  dateDebut: string;
  dateFin: string;
}

interface Enseignant {
    id: string;
  name: string;
      email: string;
  disponibilites: Disponibilite[];
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [enseignantDisponibilites, setEnseignantDisponibilites] = useState<Disponibilite[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/Auth/Signin");
    } else if (status === "authenticated") {
      if (session?.user?.role === "ADMIN") {
        fetchEnseignants();
      } else if (session?.user?.role === "ENSEIGNANT") {
        fetchEnseignantDisponibilites();
      } else {
      router.push("/welcome");
      }
    }
  }, [status, session, router]);

  const fetchEnseignants = async () => {
    try {
      const response = await fetch("/api/admin/enseignants-availabilities");
      if (response.ok) {
        const data = await response.json();
        setEnseignants(data.enseignants);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des enseignants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnseignantDisponibilites = async () => {
    try {
      const response = await fetch("/api/enseignant/disponibilites");
      if (response.ok) {
        const data = await response.json();
        setEnseignantDisponibilites(data.disponibilites || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des disponibilités:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter enseignants by search
  const filteredEnseignants = useMemo(() => {
    if (!search.trim()) return enseignants;
    return enseignants.filter(e =>
      (e.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.email || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [enseignants, search]);

  // Calendar functions for enseignant view
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const getDisponibilitesForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return enseignantDisponibilites.filter(d => {
      const disponibiliteDate = new Date(d.dateDebut);
      return disponibiliteDate.getDate() === day && 
             disponibiliteDate.getMonth() === currentDate.getMonth() &&
             disponibiliteDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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

  if (!session) {
    return null;
  }

  // Admin Calendar View - Show all enseignant availabilities
  if (session.user?.role === "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Disponibilités des enseignants</h1>
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <input
                type="text"
                placeholder="Rechercher un enseignant par nom ou email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Recherche enseignant"
              />
              <span className="text-sm text-gray-500">{filteredEnseignants.length} enseignant(s) affiché(s)</span>
            </div>
            {filteredEnseignants.length === 0 ? (
              <div className="text-gray-500 text-center py-12">Aucun enseignant trouvé.</div>
            ) : (
              <div className="space-y-8">
                {filteredEnseignants.map((enseignant) => (
                  <section key={enseignant.id} className="border border-gray-200 rounded-xl p-6 bg-gray-50" aria-label={`Disponibilités de ${enseignant.name || enseignant.email}`}> 
                    <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="font-semibold text-lg text-gray-800">{enseignant.name || enseignant.email}</h2>
                        <p className="text-sm text-gray-500">{enseignant.email}</p>
                      </div>
                      <div className="mt-2 md:mt-0 text-sm text-gray-600">
                        {enseignant.disponibilites.length} créneau(x) disponible(s)
                      </div>
                    </div>
                    {enseignant.disponibilites.length === 0 ? (
                      <div className="text-gray-400 italic mt-4">Aucune disponibilité à venir.</div>
                    ) : (
                      <div className="overflow-x-auto mt-4">
                        <table className="min-w-full divide-y divide-gray-200" aria-label="Créneaux disponibles">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date début</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date fin</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...enseignant.disponibilites].sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()).map((slot) => (
                              <tr key={slot.id}>
                                <td className="px-4 py-2 whitespace-nowrap">{new Date(slot.dateDebut).toLocaleString("fr-FR")}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{new Date(slot.dateFin).toLocaleString("fr-FR")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
            ))}
              </div>
            )}
          </div>
          </div>
        </div>
      );
    }
    
  // Enseignant Calendar View - Show their availability in calendar format
  if (session.user?.role === "ENSEIGNANT") {
    const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Mon Calendrier</h1>
            <div className="flex gap-2">
              <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                  ←
              </button>
                <span className="px-4 py-2 font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  →
                </button>
              </div>
                  </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                <div key={day} className="p-2 text-center font-semibold text-gray-600 bg-gray-100">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDay }, (_, i) => (
                <div key={`empty-${i}`} className="p-2 bg-gray-50"></div>
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const disponibilites = getDisponibilitesForDay(day);
                const isToday = new Date().getDate() === day && 
                               new Date().getMonth() === currentDate.getMonth() && 
                               new Date().getFullYear() === currentDate.getFullYear();

                return (
                  <div 
                    key={day} 
                    className={`p-2 min-h-24 border border-gray-200 ${
                      isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">{day}</div>
                    {disponibilites.map((dispo, index) => (
                              <div
                        key={dispo.id} 
                        className="text-xs bg-green-100 text-green-800 p-1 rounded mb-1"
                      >
                        {formatTime(dispo.dateDebut)} - {formatTime(dispo.dateFin)}
                              </div>
                            ))}
                          </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Disponibilité</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
                <span>Aujourd'hui</span>
                </div>
              </div>

            {/* Quick Actions */}
            <div className="mt-6 flex gap-4">
              <a 
                href="/enseignant/disponibilites" 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                Gérer mes disponibilités
              </a>
              <a 
                href="/enseignant/interview-requests" 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Voir les demandes d'entretien
              </a>
            </div>
          </div>
        </div>
    </div>
  );
  }

  return null;
}
