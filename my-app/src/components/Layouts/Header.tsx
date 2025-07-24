"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as any; // Use 'as any' to access role/id

  // Determine profile link based on role
  let profileLink = "/";
  if (user && user.role === "ADMIN") profileLink = "/admin/users/" + user.id;
  else if (user && user.role === "ETUDIANT") profileLink = "/etudiant/profile";
  else if (user && user.role === "ENSEIGNANT") profileLink = "/enseignant/profile";
  else if (user && user.role === "CANDIDAT") profileLink = "/candidat/profile";

  return (
    <header className="w-full h-16 bg-red-600 shadow flex items-center justify-between px-6 border-b z-10">
      <div className="flex items-center gap-2">
        <Image src="/images/logo/logo.jpg" alt="Logo" width={100} height={100} className="rounded mr-2" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white text-sm font-semibold">Bienvenue !</span>
        {user?.name && (
          <span className="text-white text-base font-bold">{user.name}</span>
        )}
        {/* User avatar/icon */}
        <button
          onClick={() => router.push(profileLink)}
          className="focus:outline-none flex items-center"
          title="Voir le profil"
        >
          {user?.image ? (
            <Image
              src={user.image}
              alt="Avatar"
              width={40}
              height={40}
              className="rounded-full border-2 border-white shadow"
            />
          ) : (
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-red-600 border-2 border-white shadow">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
          )}
        </button>
      </div>
    </header>
  );
} 