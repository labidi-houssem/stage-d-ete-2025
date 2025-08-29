import Link from "next/link";
import GoogleSigninButton from "../GoogleSigninButton";
import SignupWithPassword from "../SignupWithPassword";

export default function Signup() {
  return (
    <div className="space-y-6">
      {/* Google Sign Up Button */}
      <div className="w-full">
        <button className="w-full flex items-center justify-center gap-3 py-4 px-6 border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 bg-white hover:bg-gray-50 font-medium text-gray-700">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continuer avec Google</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">Ou créer un compte avec email</span>
        </div>
      </div>

      {/* Email Signup Form */}
      <div>
        <SignupWithPassword />
      </div>

      {/* Sign In Link */}
      <div className="text-center pt-4 border-t border-gray-100">
        <p className="text-gray-600">
          Déjà un compte ?{" "}
          <Link
            href="/Auth/Signin"
            className="text-red-600 hover:text-red-700 font-semibold transition-colors"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
