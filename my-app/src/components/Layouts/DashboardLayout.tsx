"use client";
import Sidebar, { SidebarLink } from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  links: SidebarLink[];
  children: React.ReactNode;
}

export default function DashboardLayout({ links, children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar: fixed width, white, shadow */}
      <div className="w-59 h-full bg-white shadow-lg border-r flex flex-col">
        <Sidebar links={links} />
      </div>
      {/* Main area: header at top, content below */}
      <div className="flex-1 flex flex-col min-h-0">
        <Header />
        <main className="flex-1 p-6 bg-gray-50 overflow-auto min-h-0">{children}</main>
      </div>
    </div>
  );
} 