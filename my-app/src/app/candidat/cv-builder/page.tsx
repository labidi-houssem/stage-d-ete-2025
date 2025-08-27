"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CVBuilderRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "CANDIDAT") {
      router.push("/Auth/Signin");
      return;
    }
    checkCV();
  }, [session, status, router]);

  const checkCV = async () => {
    try {
      const response = await fetch("/api/candidat/cv");
      if (response.ok) {
        const data = await response.json();
        if (data.cv) {
          // CV exists, redirect to CV builder
          router.push(`/candidat/cv-builder/${data.cv.id}`);
        } else {
          // No CV, redirect to dashboard to create one
          router.push("/candidat/dashboard");
        }
      } else {
        // Error or no CV, redirect to dashboard
        router.push("/candidat/dashboard");
      }
    } catch (error) {
      console.error("Error checking CV:", error);
      router.push("/candidat/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-700">Chargement de votre CV...</p>
        </div>
      </div>
    );
  }

  return null;
}
