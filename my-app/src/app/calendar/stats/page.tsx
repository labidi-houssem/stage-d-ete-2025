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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Statistiques des entretiens
        </h1>
        <p className="text-gray-600">
          Consultez les statistiques de vos entretiens d'admission
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total disponibilités</p>
              <p className="text-2xl font-semibold text-gray-900">{totalDisponibilites}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total réservations</p>
              <p className="text-2xl font-semibold text-gray-900">{totalReservations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taux de remplissage</p>
              <p className="text-2xl font-semibold text-gray-900">{availabilityRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmés</p>
              <p className="text-2xl font-semibold text-gray-900">{confirmedReservations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Répartition par statut</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">En attente</span>
              <span className="font-semibold text-yellow-600">{pendingReservations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Confirmés</span>
              <span className="font-semibold text-green-600">{confirmedReservations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Terminés</span>
              <span className="font-semibold text-blue-600">{completedReservations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Annulés</span>
              <span className="font-semibold text-red-600">{cancelledReservations}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Répartition par spécialité</h2>
          <div className="space-y-3">
            {Object.entries(specialtyStats).map(([specialty, count]) => (
              <div key={specialty} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">{specialty}</span>
                <span className="font-semibold text-primary">{count}</span>
              </div>
            ))}
            {Object.keys(specialtyStats).length === 0 && (
              <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Activity */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Activité mensuelle</h2>
        <div className="space-y-3">
          {Object.entries(monthlyStats).map(([month, count]) => (
            <div key={month} className="flex justify-between items-center">
              <span className="text-gray-600">{month}</span>
              <span className="font-semibold text-primary">{count} entretiens</span>
            </div>
          ))}
          {Object.keys(monthlyStats).length === 0 && (
            <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-center">
        <button
          onClick={() => router.push("/calendar")}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Retour au calendrier
        </button>
      </div>
    </div>
  );
} 