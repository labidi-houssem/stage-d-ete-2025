"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
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
  dashboardIcon?: React.ReactNode; // <-- add this
}

export default function Sidebar({ links, currentPath, horizontal = false, dashboardIcon }: SidebarProps) {
  const [open, setOpen] = useState(false);

  const dashboardLink = links.find(link => link.label === "Dashboard");

  if (horizontal) {
    // Responsive horizontal bar: hamburger on mobile, row on desktop
    return (
      <nav className="w-full bg-white shadow flex items-center px-4 h-14 border-b z-20 relative">
        {/* Hamburger for mobile */}
        <button
          className="md:hidden p-2 mr-2"
          onClick={() => setOpen(!open)}
          aria-label="Ouvrir le menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Links: hidden on mobile unless open, always visible on md+ */}
        <div className={`flex-1 flex gap-2 overflow-x-auto transition-all duration-200 ${open ? 'absolute left-0 top-14 w-full bg-white flex-col shadow-md p-4 z-30' : 'hidden'} md:flex md:static md:flex-row md:bg-transparent md:shadow-none md:p-0 md:z-auto`}> 
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-2 transition-colors rounded-lg hover:bg-gray-100 ${currentPath === link.href ? 'bg-gray-200 font-semibold' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="w-5 h-5">{link.icon}</span>
              <span className="ml-2">{link.label}</span>
            </Link>
          ))}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/Auth/Signin' })}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold ml-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
          </svg>
          <span className="hidden sm:inline">Se déconnecter</span>
        </button>
        {/* Overlay for mobile menu */}
        {open && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </nav>
    );
  }

  // Modern vertical sidebar
  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded bg-white shadow-md border border-gray-200"
        onClick={() => setOpen(!open)}
        aria-label="Ouvrir le menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Sidebar */}
      <aside
        className={`fixed z-20 top-0 left-0 h-full w-64 bg-gradient-to-b from-red-600 via-white to-white shadow-xl flex flex-col rounded-r-3xl transition-transform duration-200 md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="p-6 font-bold text-2xl text-white bg-black shadow flex items-center justify-between h-16">
          <span className="flex items-center gap-2">
            {dashboardIcon}
            Dashboard
          </span>
          <button
            className="md:hidden p-1 ml-2 rounded hover:bg-gray-100"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 mt-4 space-y-1 px-2">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-gray-700 hover:bg-red-100 hover:text-red-700 ${currentPath === link.href ? 'bg-red-100 text-red-700 font-bold shadow' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="w-5 h-5">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        {/* Se déconnecter button */}
        <div className="p-4 border-t mt-auto">
          <button
            onClick={() => signOut({ callbackUrl: '/Auth/Signin' })}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl shadow-lg hover:from-red-600 hover:to-red-800 transition-colors font-semibold text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
            </svg>
            Se déconnecter
          </button>
        </div>
      </aside>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

/*<DashboardLayout links={sidebarLinks} dashboardIcon={dashboardLink?.icon}>
  {children}
</DashboardLayout>*/