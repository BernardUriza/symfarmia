import React, { useState } from 'react';
import { 
  MicrophoneIcon, 
  DocumentTextIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  UserIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import LanguageToggle from '../../components/LanguageToggle';

const MinimalistLandingPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="fixed top-0 right-0 p-6 z-50">
        <LanguageToggle variant="minimal" />
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-20">
        
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
            Convierte consultas médicas en reportes clínicos automáticamente
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Habla durante tu consulta y obtén un reporte médico estructurado en segundos. 
            Sin interrupciones, sin formularios, sin perder tiempo.
          </p>
          
          {/* CTA Button */}
          <div className="mb-12">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu-email@ejemplo.com"
                    required
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isSubmitting ? 'Enviando...' : 'Quiero ahorrar tiempo'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Acceso beta gratuito • Sin compromiso
                </p>
              </form>
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
        </section>

        {/* Three Key Benefits */}
        <section className="mb-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MicrophoneIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Habla naturalmente
              </h3>
              <p className="text-gray-600">
                Realiza tu consulta como siempre. Nuestro sistema escucha y entiende el contexto médico.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowPathIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Procesamiento inteligente
              </h3>
              <p className="text-gray-600">
                IA médica especializada estructura automáticamente la información en formato clínico.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-purple-600" />
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
          
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  1
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">Consulta normal</h3>
                <p className="text-gray-600 text-sm">
                  "Paciente de 45 años con dolor torácico intermitente..."
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  2
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">Procesamiento IA</h3>
                <p className="text-gray-600 text-sm">
                  Sistema analiza y estructura la información médica
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
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
          <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-2xl mx-auto">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                <UserIcon className="w-6 h-6 text-gray-600" />
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
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            ¿Listo para recuperar tu tiempo?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Únete al beta y descubre cómo la IA puede simplificar tu práctica médica.
          </p>
          
          {!isSubmitted && (
            <button
              onClick={() => document.querySelector('input[type="email"]').scrollIntoView()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Solicita acceso beta
            </button>
          )}
        </section>

      </main>

      {/* Simple Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-600 text-sm">
            © 2024 SYMFARMIA • Hecho con 💙 para médicos en México
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-blue-600">Privacidad</a>
            <a href="#" className="text-gray-500 hover:text-blue-600">Términos</a>
            <a href="#" className="text-gray-500 hover:text-blue-600">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MinimalistLandingPage;