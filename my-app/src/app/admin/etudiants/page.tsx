import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import React from "react";
import { redirect } from "next/navigation";

export default async function EtudiantsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/welcome");
  }
  const etudiants = await prisma.etudiant.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Liste des Étudiants</h1>
      <table className="w-full border rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Nom</th>
            <th className="p-2 text-left">Prénom</th>
            <th className="p-2 text-left">Téléphone</th>
            <th className="p-2 text-left">Date de naissance</th>
            <th className="p-2 text-left">Spécialité</th>
            <th className="p-2 text-left">Ajouté le</th>
          </tr>
        </thead>
        <tbody>
          {etudiants.map((e) => (
            <tr key={e.id} className="border-b">
              <td className="p-2">{e.email}</td>
              <td className="p-2">{e.nom}</td>
              <td className="p-2">{e.prenom}</td>
              <td className="p-2">{e.telephone}</td>
              <td className="p-2">{e.dateNaissance ? new Date(e.dateNaissance).toLocaleDateString("fr-FR") : ""}</td>
              <td className="p-2">{e.specialite}</td>
              <td className="p-2">{new Date(e.createdAt).toLocaleDateString("fr-FR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 