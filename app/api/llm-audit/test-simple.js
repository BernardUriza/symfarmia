#!/usr/bin/env node

/**
 * 🗡️ TEST SIMPLE Y BRUTAL DEL ENDPOINT LLM
 */

const ENDPOINT = 'http://localhost:3000/api/llm-audit';

async function testSimpleOrco() {
  console.log("🧪 TEST DIRECTO: ORCO ENFERMO\n");

  const payload = {
    transcript: "me duele la panza doctor ayuda orco enfermo muy mal dolor como fuego help me",
    task: "audit-transcript"
  };

  console.log("📤 Enviando al endpoint:", ENDPOINT);
  console.log("📝 Payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log("\n📥 Respuesta HTTP:", response.status, response.statusText);
    
    const result = await response.json();
    console.log("\n📜 Resultado completo:");
    console.log(JSON.stringify(result, null, 2));
    
    if (result.data?.mergedTranscript) {
      console.log("\n✨ TRANSCRIPCIÓN MEJORADA:");
      console.log(result.data.mergedTranscript);
    }
    
  } catch (error) {
    console.error("\n💀 ERROR FATAL:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Ejecutar directamente sin verificaciones
console.log("⚔️ EJECUTANDO TEST SIN PIEDAD...\n");
testSimpleOrco()
  .then(() => console.log("\n✅ Test completado"))
  .catch(err => console.error("\n❌ Test falló:", err));