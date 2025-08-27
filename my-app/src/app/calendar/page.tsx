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
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-6 text-xl font-medium text-gray-700">Chargement du calendrier...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-rose-600 rounded-3xl shadow-xl mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent mb-3">
              Calendrier des Disponibilités
            </h1>
            <p className="text-xl text-gray-700 mb-2">
              Gérez et visualisez les créneaux disponibles des enseignants
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-rose-600 mx-auto rounded-full"></div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Recherche et Filtres
              </h2>
            </div>
            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Rechercher un enseignant par nom ou email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:outline-none transition-all duration-200 text-lg"
                    aria-label="Recherche enseignant"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="inline-flex items-center px-6 py-3 bg-red-100 rounded-full">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-red-700 font-medium">
                    {filteredEnseignants.length} enseignant{filteredEnseignants.length !== 1 ? 's' : ''} affiché{filteredEnseignants.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enseignants List */}
          {filteredEnseignants.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-16 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun enseignant trouvé</h3>
              <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredEnseignants.map((enseignant) => (
                <div key={enseignant.id} className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="bg-gradient-to-r from-red-600 to-rose-600 px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                          <span className="text-2xl">👨‍🏫</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">{enseignant.name || enseignant.email}</h2>
                          <p className="text-red-100">{enseignant.email}</p>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full">
                          <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-white font-medium">
                            {enseignant.disponibilites.length} créneau{enseignant.disponibilites.length !== 1 ? 'x' : ''} disponible{enseignant.disponibilites.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    {enseignant.disponibilites.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-lg font-medium">Aucune disponibilité à venir</p>
                        <p className="text-gray-400">Cet enseignant n'a pas encore défini ses créneaux</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-red-50">Date de début</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-red-50">Date de fin</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 bg-red-50">Durée</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {[...enseignant.disponibilites].sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()).map((slot) => {
                              const startDate = new Date(slot.dateDebut);
                              const endDate = new Date(slot.dateFin);
                              const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

                              return (
                                <tr key={slot.id} className="hover:bg-red-50 transition-colors duration-200">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center">
                                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                                      <span className="text-gray-900 font-medium">
                                        {startDate.toLocaleDateString("fr-FR", {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600 ml-6">
                                      {startDate.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-gray-900 font-medium">
                                      {endDate.toLocaleDateString("fr-FR", {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {endDate.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {duration} min
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-rose-600 rounded-3xl shadow-xl mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent mb-3">
            Mon Calendrier
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Visualisez et gérez vos disponibilités
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-rose-600 mx-auto rounded-full"></div>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-600 to-rose-600 px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">
                📅 {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium"
                >
                  ← Précédent
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium"
                >
                  Suivant →
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                <div key={day} className="p-4 text-center font-bold text-gray-700 bg-gray-100 rounded-xl">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDay }, (_, i) => (
                <div key={`empty-${i}`} className="p-4 bg-gray-50 rounded-xl"></div>
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
                    className={`p-4 min-h-32 border-2 rounded-xl transition-all duration-200 ${
                      isToday 
                        ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 shadow-lg' 
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`text-lg font-bold mb-2 ${
                      isToday ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {day}
                    </div>
                    {disponibilites.map((dispo, index) => (
                      <div
                        key={dispo.id}
                        className="text-xs bg-gradient-to-r from-red-500 to-rose-500 text-white p-2 rounded-lg mb-2 shadow-sm"
                      >
                        <div className="font-medium">
                          {formatTime(dispo.dateDebut)} - {formatTime(dispo.dateFin)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-rose-500 rounded"></div>
                <span className="font-medium">Disponibilité</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded"></div>
                <span className="font-medium">Aujourd'hui</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/enseignant/disponibilites"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 focus:ring-4 focus:ring-red-200 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Gérer mes disponibilités
              </a>
              <a
                href="/enseignant/interview-requests"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Voir les demandes d'entretien
              </a>
              <a
                href="/calendar/reservations"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Mes réservations
              </a>
              <a
                href="/calendar/stats"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 focus:ring-4 focus:ring-purple-200 focus:outline-none transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Statistiques
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  }

  return null;
}
