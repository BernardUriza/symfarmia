#!/usr/bin/env node

/**
 * 🗡️ TESTS ÉPICOS DEL ENDPOINT LLM
 * "Un orco enfermo busca la sabiduría de un elfo sanador"
 */

const ENDPOINT = 'http://localhost:3000/api/llm-audit';

// 🎭 PERSONAJES
// const GRISHNAKH = "Orco Paciente";
// const ELROND = "Elfo Doctor";

// 🔥 TEST 1: CONSULTA MÉDICA ORCO-ELFO
async function testConsultaOrcaria() {
  console.log("\n⚔️ TEST 1: CONSULTA MÉDICA EN RIVENDEL");
  console.log("=====================================");

  const payload = {
    transcript: `doctor buenos dias como esta usted hoy vengo porque me duele mucho la garganta desde hace tres dias y tambien tengo fiebre muy alta doctor me puede ayudar claro que si vamos a revisarlo primero dejeme ver su garganta abra la boca por favor ahhhhh si veo que tiene las amigdalas muy inflamadas y rojas tambien tiene placas blancas que indica una infeccion bacteriana necesito hacerle unas preguntas tiene dolor al tragar si mucho dolor no puedo ni comer carne cruda ha tenido escalofrios o sudoracion nocturna si todas las noches sudo como si estuviera en mordor`,
    webSpeech: `Doctor, buenos días. ¿Cómo está usted? Hoy vengo porque me duele mucho la garganta desde hace tres días, y también tengo fiebre muy alta. Doctor, ¿me puede ayudar? Claro que sí, vamos a revisarlo. Primero, déjeme ver su garganta. Abra la boca, por favor. Ahhhh... Sí, veo que tiene las amígdalas muy inflamadas y rojas. También tiene placas blancas, lo que indica una infección bacteriana. Necesito hacerle unas preguntas. ¿Tiene dolor al tragar? Sí, mucho dolor. No puedo ni comer carne cruda. ¿Ha tenido escalofríos o sudoración nocturna? Sí, todas las noches sudo como si estuviera en Mordor.`,
    diarization: [
      { start: 0, end: 8, speaker: "Unknown" },
      { start: 8, end: 15, speaker: "Unknown" },
      { start: 15, end: 25, speaker: "Unknown" },
      { start: 25, end: 35, speaker: "Unknown" },
      { start: 35, end: 42, speaker: "Unknown" }
    ],
    task: "audit-transcript"
  };

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    console.log("📜 PERGAMINO DE RESULTADOS:");
    console.log("- Estado:", result.success ? "✅ Victoria" : "❌ Derrota");
    
    if (result.data) {
      console.log("\n🧙‍♂️ TRANSCRIPCIÓN SANADA:");
      console.log(result.data.mergedTranscript);
      
      console.log("\n👥 IDENTIFICACIÓN DE HABLANTES:");
      result.data.speakers.forEach((s, i) => {
        console.log(`${i+1}. ${s.speaker === 'Doctor' ? '🧝‍♂️' : '👹'} ${s.speaker}: "${s.text?.substring(0, 50)}..."`);
      });
      
      if (result.data.summary) {
        console.log("\n📋 RESUMEN DEL SANADOR:");
        console.log(result.data.summary);
      }
      
      if (result.data.gptLogs?.length > 0) {
        console.log("\n📖 CRÓNICAS DE LA IA:");
        result.data.gptLogs.forEach(log => console.log(`  • ${log}`));
      }
    }
  } catch (error) {
    console.error("💀 ¡El Balrog ha despertado!", error.message);
  }
}

// 🌋 TEST 2: TRANSCRIPCIÓN CORRUPTA DE MORDOR
async function testTranscripcionCorrupta() {
  console.log("\n🌋 TEST 2: TRANSCRIPCIÓN CORRUPTA DE MORDOR");
  console.log("==========================================");

  const payload = {
    transcript: `GRARGH dolor dolor mucho dolor panza orco malo comio elfo podrido AHHHHH fuego fuego en tripas ayuda shaman elfo medicina dar rapido o orco morir GRAAAHHH no poder mas dolor como lava de monte doom medicina ahora o orco explotar`,
    webSpeech: `[RUIDO] dolor... dolor... mucho dolor... panza... orco malo... comió elfo podrido... [GRITO] fuego... fuego en tripas... ayuda shamán... elfo... medicina dar rápido o orco morir... [RUGIDO] no poder más... dolor como lava de Monte Doom... medicina ahora o orco explotar...`,
    diarization: [
      { start: 0, end: 15, speaker: "Unknown", text: "GRARGH dolor dolor mucho dolor" },
      { start: 15, end: 30, speaker: "Unknown", text: "panza orco malo comio elfo podrido" }
    ],
    task: "diarize"
  };

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("🔮 Resultado:", result.success ? "El palantír revela la verdad" : "Las sombras ocultan el mensaje");
    
    if (result.data?.mergedTranscript) {
      console.log("\n✨ TRANSCRIPCIÓN PURIFICADA:");
      console.log(result.data.mergedTranscript);
    }
  } catch (error) {
    console.error("🕷️ ¡Ella-Laraña ha cortado las comunicaciones!", error.message);
  }
}

// 🏥 TEST 3: MÚLTIPLES SPEAKERS EN LA CASA DE CURACIÓN
async function testMultiplesSpeakers() {
  console.log("\n🏥 TEST 3: CASA DE CURACIÓN DE RIVENDEL");
  console.log("========================================");

  const payload = {
    transcript: `bienvenido a rivendel como se siente hoy me duele todo desde la batalla quien lo ataco fueron los trasgos de las montanas nubladas dejeme examinar sus heridas oh por elbereth estas heridas estan infectadas enfermera arwen traiga el athelas rapido si maestro elrond enseguida tambien necesitaremos vendas limpias y agua caliente entendido ya vuelvo paciente aguante un poco mas esto puede doler`,
    diarization: [
      { start: 0, end: 5 },
      { start: 5, end: 10 },
      { start: 10, end: 15 },
      { start: 15, end: 20 },
      { start: 20, end: 25 },
      { start: 25, end: 30 },
      { start: 30, end: 35 },
      { start: 35, end: 40 }
    ],
    task: "diarize"
  };

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.success && result.data) {
      console.log("🎭 IDENTIFICACIÓN DE PERSONAJES:");
      const speakers = new Set(result.data.speakers.map(s => s.speaker));
      console.log(`Se identificaron ${speakers.size} hablantes: ${Array.from(speakers).join(', ')}`);
      
      console.log("\n📜 DIÁLOGO RECONSTRUIDO:");
      result.data.speakers.forEach(s => {
        const emoji = s.speaker === 'Doctor' ? '🧝‍♂️' : '🧑‍⚕️';
        console.log(`${emoji} ${s.speaker}: "${s.text}"`);
      });
    }
  } catch (error) {
    console.error("🦅 ¡Las Águilas no llegaron a tiempo!", error.message);
  }
}

// 💀 TEST 4: CASOS EXTREMOS DEL ABISMO
async function testCasosExtremos() {
  console.log("\n💀 TEST 4: CASOS EXTREMOS DEL ABISMO");
  console.log("====================================");

  // Test con transcripción vacía
  console.log("\n1️⃣ Pergamino en blanco:");
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: "", task: "audit-transcript" })
    });
    const result = await response.json();
    console.log(result.success ? "❌ No debería aceptar vacío" : "✅ Rechazado correctamente");
  } catch (error) {
    console.log("✅ Error capturado:", error.message);
  }

  // Test con payload malformado
  console.log("\n2️⃣ Hechizo mal pronunciado:");
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"transcript": "test", "task": "conquistar-gondor"}'
    });
    const result = await response.json();
    console.log("Resultado:", result.success ? "⚠️ Procesado con task inválido" : "✅ Error detectado");
  } catch (error) {
    console.log("✅ Hechizo rechazado:", error.message);
  }

  // Test GET no permitido
  console.log("\n3️⃣ Intentando entrar por la puerta trasera:");
  try {
    const response = await fetch(ENDPOINT, { method: 'GET' });
    const result = await response.json();
    console.log("Estado:", result);
  } catch (error) {
    console.log("🚪 Puerta cerrada:", error.message);
  }
}

// 🎬 EJECUTAR LA SAGA COMPLETA
async function ejecutarSagaCompleta() {
  console.log("🏰 INICIANDO LA SAGA DE TESTS ÉPICOS DEL ENDPOINT LLM");
  console.log("=====================================================");
  console.log("📍 Endpoint objetivo:", ENDPOINT);
  console.log("🧙‍♂️ Invocando el poder de ChatGPT...\n");

  await testConsultaOrcaria();
  await new Promise(r => setTimeout(r, 2000)); // Descanso entre batallas
  
  await testTranscripcionCorrupta();
  await new Promise(r => setTimeout(r, 2000));
  
  await testMultiplesSpeakers();
  await new Promise(r => setTimeout(r, 2000));
  
  await testCasosExtremos();

  console.log("\n\n🎊 ¡LA SAGA HA CONCLUIDO!");
  console.log("==========================");
  console.log("🏆 Los tests han sido completados. Que los Valar los juzguen.\n");
}

// Verificar que el servidor esté corriendo
fetch('http://localhost:3000/api/health')
  .then(() => {
    console.log("✅ Servidor detectado. Iniciando tests...\n");
    ejecutarSagaCompleta();
  })
  .catch(() => {
    console.error("❌ ERROR: El servidor no está corriendo en http://localhost:3000");
    console.error("🔧 Ejecuta 'npm run dev' primero, joven Hobbit.");
    process.exit(1);
  });