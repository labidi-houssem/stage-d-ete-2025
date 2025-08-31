"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';

export type SidebarLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

interface SidebarProps {
  links: SidebarLink[];
  currentPath?: string;
  horizontal?: boolean;
  dashboardIcon?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ links, currentPath, horizontal = false, dashboardIcon, isOpen = false, onClose }: SidebarProps) {
  const [open, setOpen] = useState(false);

  // Use the prop value if provided, otherwise use local state
  const sidebarOpen = isOpen !== undefined ? isOpen : open;
  const handleClose = onClose || (() => setOpen(false));

  if (horizontal) {
    return (
      <nav className="w-full bg-white shadow-lg flex items-center px-6 h-16 border-b border-gray-100 z-20 relative">
        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 mr-4 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Ouvrir le menu"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo/Brand */}
        <div className="flex items-center gap-3 mr-8">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            ESPRIT
          </span>
        </div>

        {/* Navigation Links */}
        <div className={`flex-1 flex gap-1 overflow-x-auto transition-all duration-300 ${open ? 'absolute left-0 top-16 w-full bg-white flex-col shadow-xl p-4 z-30' : 'hidden'} lg:flex lg:static lg:flex-row lg:bg-transparent lg:shadow-none lg:p-0 lg:z-auto`}> 
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-2.5 transition-all duration-200 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:shadow-md ${currentPath === link.href ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg scale-105' : 'text-gray-700 hover:text-red-600'}`}
              onClick={handleClose}
            >
              <span className="w-5 h-5 mr-3">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3 ml-4">
          <button
            onClick={() => signOut({ callbackUrl: '/Auth/Signin' })}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
            </svg>
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>

        {/* Mobile overlay */}
        {open && (
          <div
            className="fixed inset-0 bg-black bg-opacity-20 z-10 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </nav>
    );
  }

  // Modern vertical sidebar
  return (
    <>
      {/* Mobile Hamburger - Hidden since we use the one in header */}
      <button
        className="hidden"
        onClick={() => setOpen(!open)}
        aria-label="Ouvrir le menu"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed z-40 top-0 left-0 h-full w-64 sm:w-72 bg-gradient-to-b from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden`}
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
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
              className={`group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 font-medium touch-target ${
                currentPath === link.href 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg transform scale-105' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 hover:shadow-md'
              }`}
              onClick={handleClose}
            >
              <span className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                currentPath === link.href 
                  ? 'text-white' 
                  : 'text-gray-500 group-hover:text-red-500'
              }`}>
                {link.icon}
              </span>
              <span className="text-sm sm:text-base">{link.label}</span>
              {currentPath === link.href && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-200">
          <button
            onClick={() => signOut({ callbackUrl: '/Auth/Signin' })}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl sm:rounded-2xl shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold text-sm sm:text-base transform hover:scale-105 hover:shadow-xl touch-target"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
            </svg>
            <span className="hidden sm:inline">Se déconnecter</span>
            <span className="sm:hidden">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden backdrop-blur-sm"
          onClick={handleClose}
        />
      )}
    </>
  );
}