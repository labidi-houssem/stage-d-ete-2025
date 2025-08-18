"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BellIcon } from "@/assets/icons";
import { useEffect, useRef, useState } from "react";
import { Calendar } from "../Layouts/sidebar/icons"; // For reservation type icon

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

  // Notification dropdown state
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = () => {
    if (session) {
      setLoading(true);
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          setNotifications(data.notifications || []);
        })
        .finally(() => setLoading(false));
    }
  };

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (showDropdown && session) {
      fetchNotifications();
    }
  }, [showDropdown, session]);

  // Polling for real-time updates
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [session]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark notification as read
  const handleNotificationClick = async (notif: any) => {
    if (!notif.read) {
      await fetch(`/api/notifications/${notif.id}`, { method: "PATCH" });
      fetchNotifications();
    }
    setShowDropdown(false);
    if (notif.link) {
      window.location.href = notif.link;
    }
  };

  // Icon by type
  const getNotifIcon = (type: string) => {
    switch (type) {
      case "reservation":
        return <Calendar className="w-5 h-5 text-blue-500 mr-2" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-400 mr-2" />;
    }
  };

  return (
    <header className="w-full h-16 bg-red-600 shadow flex items-center justify-between px-6 border-b z-10">
      <div className="flex items-center gap-2">
        <Image src="/images/logo/logo.png" alt="Logo" width={100} height={100} className="rounded mr-2" />
      </div>
      <div className="flex items-center gap-4 relative">
        <span className="text-white text-sm font-semibold">Bienvenue !</span>
        {user?.name && (
          <span className="text-white text-base font-bold">{user.name}</span>
        )}
        {/* Notification icon */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="focus:outline-none flex items-center relative"
            title="Notifications"
            onClick={() => setShowDropdown((v) => !v)}
          >
            <BellIcon className="w-7 h-7 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center border-2 border-red-600">
                {unreadCount}
              </span>
            )}
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded shadow-lg z-50 max-h-96 overflow-y-auto border border-gray-200">
              <div className="p-4 border-b font-bold text-gray-700">Notifications</div>
              {loading ? (
                <div className="p-4 text-center text-gray-500">Chargement...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Aucune notification</div>
              ) : (
                <ul>
                  {notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className={`px-4 py-3 border-b last:border-b-0 cursor-pointer flex items-start ${notif.read ? 'bg-white' : 'bg-gray-100'}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      {getNotifIcon(notif.type)}
                      <div className="flex flex-col flex-1">
                        <span className="text-sm text-gray-800">{notif.message}</span>
                        <span className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString('fr-FR')}</span>
                        {notif.link && (
                          <span className="text-xs text-blue-600 hover:underline mt-1">Voir plus</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
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