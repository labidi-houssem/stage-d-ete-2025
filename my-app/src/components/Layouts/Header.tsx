"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BellIcon } from "@/assets/icons";
import { useEffect, useRef, useState } from "react";
import { Calendar } from "../Layouts/sidebar/icons";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as any;

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
        return <Calendar className="w-5 h-5 text-red-500 mr-3" />;
      default:
        return <BellIcon className="w-5 h-5 text-red-500 mr-3" />;
    }
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "ADMIN": return "Administrateur";
      case "ENSEIGNANT": return "Enseignant";
      case "CANDIDAT": return "Candidat";
      case "ETUDIANT": return "Étudiant";
      default: return role;
    }
  };

  return (
    <header className="w-full h-16 sm:h-20 bg-gradient-to-r from-white via-gray-50 to-white shadow-lg border-b border-gray-100 flex items-center justify-between px-3 sm:px-6 z-10 relative">
      {/* Left side - Logo and Brand */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Mobile menu button - only visible on mobile */}
        <button 
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
          onClick={onToggleSidebar}
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Right side - User info and actions */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
        {/* Welcome message - responsive visibility */}
        <div className="hidden md:block text-right">
          <p className="text-xs sm:text-sm text-gray-600">Bienvenue !</p>
          <p className="text-sm sm:text-base font-semibold text-gray-800 truncate max-w-32 sm:max-w-none">
            {user?.name || user?.email}
          </p>
          <p className="text-xs text-red-600 font-medium">{getRoleDisplayName(user?.role)}</p>
        </div>

        {/* Notification bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="relative p-2 sm:p-3 rounded-xl bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 touch-target"
            title="Notifications"
            onClick={() => setShowDropdown((v) => !v)}
          >
            <BellIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-xs w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center border-2 border-white shadow-lg font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto border border-gray-100 transform transition-all duration-200">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                      {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-8 h-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
                  <p className="mt-3 text-gray-500">Chargement...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BellIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Aucune notification</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        notif.read 
                          ? 'bg-gray-50 hover:bg-gray-100' 
                          : 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500'
                      } mb-2`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="flex items-start">
                        {getNotifIcon(notif.type)}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            notif.read ? 'text-gray-700' : 'text-red-800'
                          }`}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notif.createdAt).toLocaleString('fr-FR')}
                          </p>
                          {notif.link && (
                            <span className="inline-block mt-2 text-xs text-red-600 hover:text-red-700 font-medium">
                              Voir plus →
                            </span>
                          )}
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-red-500 rounded-full ml-2 mt-2 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User profile */}
        <button
          onClick={() => router.push(profileLink)}
          className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group touch-target"
          title="Voir le profil"
        >
          {user?.image ? (
            <Image
              src={user.image}
              alt="Avatar"
              width={40}
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-2 sm:border-3 border-gray-200 shadow-lg group-hover:border-red-300 transition-all duration-200"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center border-2 sm:border-3 border-gray-200 shadow-lg group-hover:border-red-300 transition-all duration-200">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          <div className="hidden lg:block text-left">
            <p className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">
              Profil
            </p>
            <p className="text-xs text-gray-500">Cliquer pour voir</p>
          </div>
        </button>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-50/30 via-transparent to-red-50/30 pointer-events-none"></div>
    </header>
  );
} 