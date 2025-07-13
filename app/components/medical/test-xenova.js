'use client'
import { useEffect, useState } from 'react';

export default function TestXenova() {
  const [output, setOutput] = useState('');

  useEffect(() => {
    async function run() {
      setOutput('Loading...');
      const { pipeline } = await import('@xenova/transformers');
      const transcriber = await pipeline(
        'automatic-speech-recognition', 
        'Xenova/whisper-tiny'
      );
      // Puedes poner un audio aquí, pero prueba solo que carga:
      setOutput('Model loaded! Now transcribe something.');
    }
    run();
  }, []);

  return (
    <div>
      <h1>Test Xenova en cliente</h1>
      <pre>{output}</pre>
    </div>
  );
}
