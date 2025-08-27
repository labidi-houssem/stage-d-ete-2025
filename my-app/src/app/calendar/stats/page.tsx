"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Disponibilite {
  id: string;
  dateDebut: string;
  dateFin: string;
  reservations: Array<{
    id: string;
    status: string;
    candidat: {
      specialite: string;
    };
  }>;
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [disponibilites, setDisponibilites] = useState<Disponibilite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user?.role !== "ENSEIGNANT") {
      router.push("/calendar");
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/disponibilite");
      if (response.ok) {
        const data = await response.json();
        setDisponibilites(data.disponibilites);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalDisponibilites = disponibilites.length;
  const totalReservations = disponibilites.reduce((sum, d) => sum + d.reservations.length, 0);
  const confirmedReservations = disponibilites.reduce((sum, d) => 
    sum + d.reservations.filter(r => r.status === "CONFIRMEE").length, 0
  );
  const pendingReservations = disponibilites.reduce((sum, d) => 
    sum + d.reservations.filter(r => r.status === "EN_ATTENTE").length, 0
  );
  const cancelledReservations = disponibilites.reduce((sum, d) => 
    sum + d.reservations.filter(r => r.status === "ANNULEE").length, 0
  );
  const completedReservations = disponibilites.reduce((sum, d) => 
    sum + d.reservations.filter(r => r.status === "TERMINEE").length, 0
  );

  // Calculate availability rate
  const availabilityRate = totalDisponibilites > 0 
    ? Math.round((totalReservations / totalDisponibilites) * 100) 
    : 0;

  // Get specialty distribution
  const specialtyStats = disponibilites.reduce((acc, d) => {
    d.reservations.forEach(r => {
      const specialty = r.candidat.specialite;
      acc[specialty] = (acc[specialty] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Get monthly stats
  const monthlyStats = disponibilites.reduce((acc, d) => {
    const month = new Date(d.dateDebut).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    acc[month] = (acc[month] || 0) + d.reservations.length;
    return acc;
  }, {} as Record<string, number>);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-700">Chargement des statistiques...</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent">
              Statistiques des entretiens
            </h1>
          </div>
          <p className="text-gray-700 text-lg">
            Consultez les statistiques de vos entretiens d'admission
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Disponibilités */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Total disponibilités</p>
                <p className="text-3xl font-bold text-gray-900">{totalDisponibilites}</p>
              </div>
            </div>
          </div>

          {/* Total Réservations */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Total réservations</p>
                <p className="text-3xl font-bold text-gray-900">{totalReservations}</p>
              </div>
            </div>
          </div>

          {/* Taux de Remplissage */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Taux de remplissage</p>
                <p className="text-3xl font-bold text-gray-900">{availabilityRate}%</p>
              </div>
            </div>
          </div>

          {/* Confirmés */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Confirmés</p>
                <p className="text-3xl font-bold text-gray-900">{confirmedReservations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Répartition par statut */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Répartition par statut</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">En attente</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{pendingReservations}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">Confirmés</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{confirmedReservations}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">Terminés</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{completedReservations}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">Annulés</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{cancelledReservations}</span>
              </div>
            </div>
          </div>

          {/* Répartition par spécialité */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Répartition par spécialité</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(specialtyStats).map(([specialty, count], index) => (
                <div key={specialty} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index % 4 === 0 ? 'bg-purple-500' :
                      index % 4 === 1 ? 'bg-indigo-500' :
                      index % 4 === 2 ? 'bg-blue-500' : 'bg-teal-500'
                    }`}></div>
                    <span className="font-medium text-gray-700 capitalize">{specialty}</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{count}</span>
                </div>
              ))}
              {Object.keys(specialtyStats).length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Activity */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Activité mensuelle</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(monthlyStats).map(([month, count], index) => (
              <div key={month} className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 hover:from-orange-100 hover:to-red-100 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-700">{month}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-orange-600">{count}</span>
                  <p className="text-sm text-gray-500">entretiens</p>
                </div>
              </div>
            ))}
            {Object.keys(monthlyStats).length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune activité</h3>
                <p className="text-gray-500">Les données d'activité apparaîtront ici.</p>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
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
      </div>
    </div>
  );
}