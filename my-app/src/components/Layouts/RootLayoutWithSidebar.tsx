"use client";
import { usePathname } from "next/navigation";
import ClientRootLayout from "./ClientRootLayout";

export default function RootLayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/Auth") || pathname === "/") {
    return <>{children}</>;
  }

  return <ClientRootLayout>{children}</ClientRootLayout>;
}
