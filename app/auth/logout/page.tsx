"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Clear all local storage items
    localStorage.clear();
    
    // Clear all session storage items
    sessionStorage.clear();
    
    // Clear cookies (if any)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Redirect to home page after a short delay
    const timer = setTimeout(() => {
      router.push('/');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600 "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sesión cerrada exitosamente
          </h1>
          <p className="text-gray-600 mb-6">
            Gracias por usar el Sistema Médico SYMFARMIA
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-500 ">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Redirigiendo al inicio...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
