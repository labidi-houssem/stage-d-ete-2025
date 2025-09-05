import Signup from "@/components/Auth/Signup";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inscription - Plateforme d'Entretiens",
  description: "Créez votre compte pour accéder à la plateforme d'entretiens"
};

export default function SignUp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Modern Card Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="flex flex-wrap min-h-[700px]">
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
                    Rejoignez-nous !
                  </h1>
                  <p className="text-gray-600">
                    Créez votre compte pour commencer
                  </p>
                </div>

                {/* Form Component */}
                <Signup />
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-600 via-pink-600 to-red-600 items-center justify-center p-12 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="grid grid-cols-6 gap-6 h-full">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl animate-pulse"
                        style={{
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: '3s'
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 text-center text-white">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>

                <h2 className="text-4xl font-bold mb-6 leading-tight">
                  Commencez votre parcours
                </h2>

                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Rejoignez notre communauté et accédez à toutes les fonctionnalités
                </p>

                <div className="grid grid-cols-1 gap-6 text-left max-w-sm mx-auto">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Inscription gratuite</h3>
                      <p className="text-white/80 text-sm">Créez votre compte en quelques minutes</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Sécurisé et privé</h3>
                      <p className="text-white/80 text-sm">Vos données sont protégées</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Accès immédiat</h3>
                      <p className="text-white/80 text-sm">Commencez à utiliser la plateforme</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-16 right-16 w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-sm animate-bounce"></div>
              <div className="absolute bottom-16 left-16 w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-sm animate-pulse"></div>
              <div className="absolute top-1/3 right-8 w-12 h-12 bg-white/10 rounded-xl backdrop-blur-sm animate-ping"></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            © 2025 Plateforme d'Entretiens. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}