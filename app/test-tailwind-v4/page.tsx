"use client";

export default function TestTailwindV4() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🚀 Tailwind v4 CSS-First Configuration
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Configuración completa en app/globals.css con @theme
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-background rounded-2xl shadow-xl p-8 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-foreground">Estado del Sistema</h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 font-medium">Activo</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Configuración</div>
              <div className="text-lg font-semibold text-foreground">@theme en CSS</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Archivo JS</div>
              <div className="text-lg font-semibold text-red-600 dark:text-red-400 line-through">tailwind.config.js</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">PostCSS</div>
              <div className="text-lg font-semibold text-foreground">@tailwindcss/postcss</div>
            </div>
          </div>
        </div>

        {/* Medical Theme Test */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Tema Médico Personalizado</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="medical-card p-6">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🏥</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Primary</h4>
              <div className="h-20 bg-gradient-to-r from-sky-400 to-sky-600 rounded-lg"></div>
            </div>
            
            <div className="medical-card p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💉</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Accent</h4>
              <div className="h-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg"></div>
            </div>
            
            <div className="medical-card p-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Success</h4>
              <div className="h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-lg"></div>
            </div>
            
            <div className="medical-card p-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🚨</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Error</h4>
              <div className="h-20 bg-gradient-to-r from-red-400 to-red-600 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Components Test */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Componentes Médicos</h3>
          
          <div className="bg-background rounded-xl p-6 shadow-lg border border-border">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Input Médico
                </label>
                <input type="text" className="input-medical" placeholder="Nombre del paciente..." />
              </div>
              
              <div className="flex space-x-4">
                <button className="btn-medical-primary">
                  Guardar Registro
                </button>
                <button className="px-6 py-3 rounded-xl font-medium border-2 border-border text-foreground/70 hover:bg-background transition-all duration-300">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="text-xl font-bold text-foreground mb-4">✨ Características v4</h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>✓ Configuración CSS-first con @theme</li>
              <li>✓ Colores OKLCH para P3 gamut</li>
              <li>✓ Container queries nativos</li>
              <li>✓ Animaciones @starting-style</li>
              <li>✓ Dark mode con color-scheme</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
            <h4 className="text-xl font-bold text-foreground mb-4">🏥 Sistema Médico</h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>✓ Tema médico profesional</li>
              <li>✓ Componentes reutilizables</li>
              <li>✓ Gradientes modernos</li>
              <li>✓ Accesibilidad mejorada</li>
              <li>✓ Performance optimizada</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}