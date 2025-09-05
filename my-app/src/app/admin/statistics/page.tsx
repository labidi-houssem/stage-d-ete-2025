import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import React from "react";
import { redirect } from "next/navigation";

export default async function StatisticsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/welcome");
  }
  // Counts
  const candidats = await prisma.user.count({ where: { role: "CANDIDAT" } });
  const enseignants = await prisma.user.count({ where: { role: "ENSEIGNANT" } });
  const etudiants = await prisma.user.count({ where: { role: "ETUDIANT" } });
  // Reservations by status
  const statuses = ["EN_ATTENTE", "CONFIRMEE", "ANNULEE", "TERMINEE"] as const;
  const reservationsByStatus = Object.fromEntries(
    await Promise.all(
      statuses.map(async (status) => [status, await prisma.reservation.count({ where: { status: status as any } })])
    )
  );
  // Top 5 enseignants by number of interviews
  const topEnseignants = await prisma.user.findMany({
    where: { role: "ENSEIGNANT" },
    select: {
      id: true,
      nom: true,
      prenom: true,
      disponibilites: {
        select: {
          reservations: true
        }
      }
    }
  });
  const enseignantStats = topEnseignants.map(e => ({
    id: e.id,
    nom: e.nom,
    prenom: e.prenom,
    count: e.disponibilites.reduce((acc, d) => acc + d.reservations.length, 0)
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Statistiques</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 rounded-lg p-4">
          <div className="text-lg font-semibold">Candidats</div>
          <div className="text-3xl font-bold">{candidats}</div>
        </div>
        <div className="bg-green-100 rounded-lg p-4">
          <div className="text-lg font-semibold">Enseignants</div>
          <div className="text-3xl font-bold">{enseignants}</div>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4">
          <div className="text-lg font-semibold">Étudiants</div>
          <div className="text-3xl font-bold">{etudiants}</div>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2">Réservations par statut</h2>
      <ul className="mb-8">
        {statuses.map(status => (
          <li key={status} className="mb-1">
            <span className="font-medium">{status}:</span> {reservationsByStatus[status]}
          </li>
        ))}
      </ul>
      <h2 className="text-xl font-semibold mb-2">Top 5 enseignants par nombre d'entretiens</h2>
      <table className="w-full border rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Nom</th>
            <th className="p-2 text-left">Prénom</th>
            <th className="p-2 text-left">Nombre d'entretiens</th>
          </tr>
        </thead>
        <tbody>
          {enseignantStats.map(e => (
            <tr key={e.id} className="border-b">
              <td className="p-2">{e.nom}</td>
              <td className="p-2">{e.prenom}</td>
              <td className="p-2">{e.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 