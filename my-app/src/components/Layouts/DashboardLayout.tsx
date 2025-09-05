"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import Sidebar, { SidebarLink } from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  links: SidebarLink[];
  children: React.ReactNode;
}

// Desktop Sidebar Component
const DesktopSidebar = ({ links }: { links: SidebarLink[] }) => {
  return (
    <aside className="w-full h-full bg-gradient-to-b from-white via-gray-50 to-gray-100 flex flex-col shadow-2xl" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-red-600 via-red-700 to-red-800 shadow-lg">
        <div className="flex items-center justify-center">
          <Image 
            src="/images/logo/logo.png" 
            alt="ESPRIT Logo" 
            width={80} 
            height={40} 
            className="w-16 h-8 sm:w-20 sm:h-10 lg:w-24 lg:h-12 rounded-lg"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-1 sm:space-y-2">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 font-medium text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 hover:shadow-md"
          >
            <span className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 text-gray-500 group-hover:text-red-500">
              {link.icon}
            </span>
            <span className="text-sm sm:text-base">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: '/Auth/Signin' })}
          className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl sm:rounded-2xl shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold text-sm sm:text-base transform hover:scale-105 hover:shadow-xl"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
          </svg>
          <span className="hidden sm:inline">Se déconnecter</span>
          <span className="sm:hidden">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default function DashboardLayout({ links, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar: only visible on large screens */}
      <div className="hidden lg:block w-65 h-full shadow-2xl relative z-10">
        <DesktopSidebar links={links} />
      </div>
      
      {/* Main area: header at top, content below */}
      <div className="flex-1 flex flex-col min-h-0 w-full lg:w-auto">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 p-3 sm:p-4 lg:p-6 bg-gray-50 overflow-auto min-h-0">{children}</main>
      </div>
      
      {/* Mobile Sidebar: positioned absolutely, controlled by state */}
      <Sidebar 
        links={links} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
    </div>
  );
} 