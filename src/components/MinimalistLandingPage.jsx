import React, { useState, useEffect } from 'react';
import { 
  MicrophoneIcon, 
  DocumentTextIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  UserIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import LanguageToggle from '../../components/LanguageToggle';
import DemoLoginModal from '../../components/DemoLoginModal';
import TailwindTest from './TailwindTest';
import DashboardLanding from './DashboardLanding';

const MinimalistLandingPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Check if we're in demo mode - simplified approach
  useEffect(() => {
    const checkDemoMode = () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const isDemo = urlParams.get('demo') === 'true';
        console.log('MinimalistLandingPage: Checking demo mode:', isDemo, window.location.search);
        setIsDemoMode(isDemo);
      }
    };
    
    checkDemoMode();
    
    // Listen for URL changes
    window.addEventListener('popstate', checkDemoMode);
    
    return () => {
      window.removeEventListener('popstate', checkDemoMode);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form after success
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail('');
    }, 3000);
  };
  
  const handleDemoClick = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);
  const handleDemoLogin = () => {
    setIsModalOpen(false);
    console.log('handleDemoLogin: Redirecting to demo mode');
    window.location.href = window.location.pathname + '?demo=true';
  };

  // If in demo mode, render the dashboard instead
  if (isDemoMode) {
    console.log('MinimalistLandingPage: Rendering DashboardLanding');
    return <DashboardLanding />;
  }
  
  console.log('MinimalistLandingPage: Rendering normal landing page');

  // Temporary Tailwind test - remove this once styling is confirmed
  if (typeof window !== 'undefined' && window.location.search.includes('test=tailwind')) {
    return <TailwindTest />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="fixed top-0 right-0 p-6 z-50">
        <LanguageToggle variant="minimal" />
      </header>
      
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-6 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-center">
            <HeartIcon className="w-5 h-5 mr-2" />
            <span className="font-semibold">Modo Demo Activo</span>
            <span className="ml-2 text-green-100">• Explora todas las funcionalidades</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`max-w-4xl mx-auto px-6 ${isDemoMode ? 'pt-32' : 'pt-20'}`}>
        
        {/* Hero Section */}
        <section className="text-center mb-20">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Convierte 666consultas médicas en reportes clínicos automáticamente
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Habla durante tu consulta y obtén un reporte médico estructurado en segundos. 
              Sin interrupciones, sin formularios, sin perder tiempo.
            </p>
          
            {/* CTA Buttons */}
            <div className="mb-12">
              {!isDemoMode && !isSubmitted ? (
                <div className="space-y-6">
                  <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu-email@ejemplo.com"
                        required
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        {isSubmitting ? 'Enviando...' : 'Quiero ahorrar tiempo'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Acceso beta gratuito • Sin compromiso
                    </p>
                  </form>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleDemoClick}
                      className="bg-white/80 hover:bg-white border-2 border-blue-200 hover:border-blue-300 text-blue-600 font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
                    >
                      🎯 Prueba el Demo Interactivo
                    </button>
                  </div>
                </div>
              ) : isDemoMode ? (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl p-6 shadow-lg">
                    <HeartIcon className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold mb-2">
                      ¡Bienvenido al Demo de SYMFARMIA!
                    </h3>
                    <p className="text-green-100">
                      Explora todas las funcionalidades con datos de ejemplo
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    ¡Perfecto! Te contactaremos pronto
                  </h3>
                  <p className="text-gray-600">
                    Revisa tu email para los próximos pasos
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Three Key Benefits */}
        <section className="mb-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 text-center hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MicrophoneIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Habla naturalmente
              </h3>
              <p className="text-gray-600">
                Realiza tu consulta como siempre. Nuestro sistema escucha y entiende el contexto médico.
              </p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 text-center hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ArrowPathIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Procesamiento inteligente
              </h3>
              <p className="text-gray-600">
                IA médica especializada estructura automáticamente la información en formato clínico.
              </p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 text-center hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <DocumentTextIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Reporte instantáneo
              </h3>
              <p className="text-gray-600">
                Obtén un PDF con diagnóstico, tratamiento y recomendaciones listo para entregar.
              </p>
            </div>
          </div>
        </section>

        {/* Process Flow Simulation */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Así de simple funciona
          </h2>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-lg">
                  1
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">Consulta normal</h3>
                <p className="text-gray-600 text-sm">
                  "Paciente de 45 años con dolor torácico intermitente..."
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-lg">
                  2
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">Procesamiento IA</h3>
                <p className="text-gray-600 text-sm">
                  Sistema analiza y estructura la información médica
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-lg">
                  3
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">Reporte listo</h3>
                <p className="text-gray-600 text-sm">
                  PDF con diagnóstico, tratamiento y seguimiento
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Testimonial */}
        <section className="mb-20">
          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-8 max-w-2xl mx-auto shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Dr. María González</h3>
                <p className="text-gray-600 text-sm">Medicina Interna, CDMX</p>
              </div>
            </div>
            <blockquote className="text-gray-700 italic mb-4">
              "Antes tardaba 15 minutos escribiendo cada reporte. Ahora me concentro en el paciente 
              y el sistema hace el resto. Es exactamente lo que necesitaba."
            </blockquote>
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">Ahorra 2 horas diarias</span>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center mb-20">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              ¿Listo para recuperar tu tiempo?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Únete al beta y descubre cómo la IA puede simplificar tu práctica médica.
            </p>
            
            {!isSubmitted && !isDemoMode && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => document.querySelector('input[type="email"]').scrollIntoView()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Solicita acceso beta
                </button>
                <button
                  onClick={handleDemoClick}
                  className="bg-white/80 hover:bg-white border-2 border-blue-200 hover:border-blue-300 text-blue-600 font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  O prueba el demo
                </button>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Simple Footer */}
      <footer className="border-t border-white/30 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-600 text-sm">
            © 2024 SYMFARMIA • Hecho con 💙 para médicos en México
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Privacidad</a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Términos</a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
      
      {/* Demo Login Modal */}
      <DemoLoginModal isOpen={isModalOpen} onClose={handleModalClose} onLogin={handleDemoLogin} />
    </div>
  );
};

export default MinimalistLandingPage;