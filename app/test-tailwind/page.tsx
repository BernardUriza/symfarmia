export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent mb-8">
          ✅ Tailwind v4 Funcionando Correctamente
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Clases Básicas</h2>
            <p className="text-gray-700 mb-4">Este es un test de clases básicas de Tailwind.</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Botón de prueba
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-2xl font-semibold mb-4">Gradientes</h2>
            <p className="mb-4">Test de gradientes de Tailwind.</p>
            <div className="bg-white text-gray-900 p-3 rounded">
              Contenido anidado
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-medical-primary mb-4">Clases Médicas</h2>
            <p className="text-gray-700 mb-4">Test de clases médicas personalizadas.</p>
            <button className="btn-medical-primary">
              Botón Médico
            </button>
            <div className="mt-4">
              <input type="text" className="input-medical" placeholder="Input médico" />
            </div>
          </div>
          
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Dark Mode</h2>
            <p className="mb-4">Test de modo oscuro.</p>
            <div className="bg-gray-700 p-3 rounded">
              <span className="text-green-400">✓</span> Elemento oscuro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}