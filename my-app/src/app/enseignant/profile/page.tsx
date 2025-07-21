"use client";
import { useSession } from "next-auth/react";

export default function EnseignantProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded-lg shadow p-8">
      <div className="flex items-center gap-4 mb-6">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 text-3xl font-bold">
          {user?.image ? (
            <img src={user.image} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            user?.name?.charAt(0) || user?.email?.charAt(0) || "?"
          )}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{user?.name || "Enseignant"}</h1>
          <p className="text-gray-600">{user?.email}</p>
          <span className="inline-block mt-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">👨‍🏫 Enseignant</span>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600 font-medium">Nom complet:</span>
          <span className="font-medium">{user?.name || "-"}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600 font-medium">Email:</span>
          <span className="font-medium">{user?.email || "-"}</span>
        </div>
        {/* Add more enseignant-specific fields here if needed */}
      </div>
    </div>
  );
} 