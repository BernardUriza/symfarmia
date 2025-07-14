'use client'
import { useEffect, useState } from 'react';

export default function TestXenova() {
  const [output, setOutput] = useState('Inicializando...');

  useEffect(() => {
    async function run() {
      try {
        setOutput('Cargando modelo Whisper...');
        const { pipeline } = await import('@xenova/transformers');
        await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
        setOutput('✅ Modelo Whisper cargado correctamente');
      } catch (error) {
        setOutput('❌ Error cargando modelo: ' + error.message);
      }
    }
    run();
  }, []);

  return (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm">
      <h3 className="font-medium text-green-800 mb-1">Test Xenova en cliente</h3>
      <p className="text-green-700">{output}</p>
    </div>
  );
}
