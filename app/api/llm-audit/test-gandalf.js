#!/usr/bin/env node

/**
 * 🧙‍♂️ Test de Gandalf para el Endpoint LLM
 * "Un test a tiempo salva nueve bugs"
 */

async function testLlmAudit() {
  console.log('🧙‍♂️ Iniciando pruebas de Gandalf...\n');

  const testCases = [
    {
      name: 'Caso Básico - Transcripción Simple',
      data: {
        transcript: 'Doctor: Buenos días señora María. ¿Cómo se encuentra hoy? Paciente: Me duele mucho la cabeza desde ayer.',
        webSpeech: 'Doctor buenos días señora maría como se encuentra hoy paciente me duele mucho la cabeza desde ayer',
        task: 'audit-transcript'
      }
    },
    {
      name: 'Caso con Diarización',
      data: {
        transcript: 'Buenos días señora María cómo se encuentra hoy me duele mucho la cabeza desde ayer',
        diarization: [
          { start: 0, end: 5, speaker: 'Unknown' },
          { start: 5, end: 10, speaker: 'Unknown' }
        ],
        task: 'diarize'
      }
    },
    {
      name: 'Caso con Datos Completos',
      data: {
        transcript: 'Doctor: La presión arterial está en 120/80. Paciente: ¿Es normal doctor?',
        webSpeech: 'la presión arterial está en ciento veinte ochenta es normal doctor',
        diarization: [
          { start: 0, end: 4, speaker: 'Doctor' },
          { start: 4, end: 8, speaker: 'Paciente' }
        ],
        partialTranscripts: ['presión arterial', '120/80', 'normal doctor'],
        confidence: 0.95,
        language: 'es-MX',
        task: 'audit-transcript'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Probando: ${testCase.name}`);
    console.log('━'.repeat(50));
    
    try {
      const response = await fetch('http://localhost:3000/api/llm-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Éxito!');
        console.log('📝 Transcripción fusionada:', result.data.mergedTranscript.substring(0, 100) + '...');
        console.log('👥 Speakers detectados:', result.data.speakers.length);
        console.log('📊 Resumen:', result.data.summary || 'No disponible');
        console.log('🔍 Logs GPT:', result.data.gptLogs?.length || 0, 'entradas');
      } else {
        console.log('❌ Error:', result.error);
      }
    } catch (error) {
      console.log('💥 Error de conexión:', error.message);
      console.log('   ¿Está el servidor corriendo en http://localhost:3000?');
    }
  }

  console.log('\n\n🧙‍♂️ "Las pruebas han concluido. ¡Que la luz de Eärendil te acompañe!"');
}

// Ejecutar las pruebas
testLlmAudit().catch(console.error);