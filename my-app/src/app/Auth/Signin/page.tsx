import Signin from "@/components/Auth/Signin";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Connexion - Plateforme d'Entretiens",
  description: "Connectez-vous à votre compte pour accéder à la plateforme d'entretiens"
};

export default function SignIn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Modern Card Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="flex flex-wrap min-h-[600px]">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
              <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                  {/* Logo */}
                  <div className="mb-6">
                    <Image
                      src="/images/logo/logo.png"
                      alt="Logo Plateforme d'Entretiens"
                      width={120}
                      height={40}
                      className="mx-auto"
                    />
                  </div>

                  <h1 className="text-3xl font-bold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent mb-2">
                    Bon retour !
                  </h1>
                  <p className="text-gray-600">
                    Connectez-vous pour accéder à votre espace
                  </p>
                </div>

                {/* Form Component */}
                <Signin />
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 items-center justify-center p-12 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="grid grid-cols-8 gap-4 h-full">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 text-center text-white">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>

                <h2 className="text-4xl font-bold mb-6 leading-tight">
                  Plateforme d'Entretiens
                </h2>

                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Gérez vos entretiens et candidatures en toute simplicité
                </p>

                <div className="grid grid-cols-2 gap-6 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/90">Interface moderne</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/90">Sécurisé</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/90">Facile à utiliser</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/90">Support 24/7</span>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-sm animate-bounce"></div>
              <div className="absolute bottom-20 left-20 w-12 h-12 bg-white/10 rounded-xl backdrop-blur-sm animate-pulse"></div>
              <div className="absolute top-1/2 right-10 w-8 h-8 bg-white/10 rounded-lg backdrop-blur-sm animate-ping"></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            © 2024 Plateforme d'Entretiens. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
