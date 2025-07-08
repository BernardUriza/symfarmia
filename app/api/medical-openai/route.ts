import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.warn('OpenAI initialization failed:', error);
}

export async function POST(request: NextRequest) {
  try {
    const { query, type = 'diagnosis', context } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI service not available - API key missing' },
        { status: 503 }
      );
    }

    // Create medical prompt based on type
    const systemPrompt = getSystemPrompt(type);
    const userPrompt = formatUserPrompt(query, context);

    // Call OpenAI
    const completion = await openai!.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';

    return NextResponse.json({
      success: true,
      response,
      model: 'gpt-4',
      type,
      timestamp: new Date().toISOString(),
      disclaimer: 'Esta respuesta es generada por IA y no sustituye el criterio médico profesional.',
    });

  } catch (error) {
    console.error('Medical OpenAI API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error processing medical query',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function getSystemPrompt(type: string): string {
  const prompts = {
    diagnosis: `Eres un médico especialista en medicina interna con 20 años de experiencia. 
    Proporciona diagnósticos diferenciales precisos y bien fundamentados.
    Estructura tu respuesta con:
    1. Diagnóstico más probable
    2. Diagnósticos diferenciales (2-3)
    3. Estudios recomendados
    4. Manejo inicial
    
    Usa terminología médica profesional pero clara. Siempre menciona que se requiere evaluación médica presencial.`,
    
    prescription: `Eres un médico clínico experto en farmacología.
    Proporciona recomendaciones de tratamiento farmacológico seguras y basadas en evidencia.
    Incluye dosis, vía de administración, frecuencia y duración.
    Menciona contraindicaciones importantes y efectos adversos a vigilar.`,
    
    soap: `Eres un médico experto en documentación clínica.
    Genera notas SOAP (Subjetivo, Objetivo, Análisis, Plan) estructuradas y completas.
    Usa terminología médica apropiada y formato estándar hospitalario.`,
    
    analytics: `Eres un médico con expertise en análisis de datos clínicos.
    Proporciona análisis estadístico y epidemiológico de la información médica presentada.
    Incluye factores de riesgo, pronóstico y recomendaciones basadas en evidencia.`
  };

  return prompts[type as keyof typeof prompts] || prompts.diagnosis;
}

function formatUserPrompt(query: string, context?: string): string {
  let prompt = `Caso clínico:\n${query}`;
  
  if (context) {
    prompt += `\n\nContexto adicional:\n${context}`;
  }
  
  prompt += `\n\nProporciona tu análisis médico profesional.`;
  
  return prompt;
}

export async function GET() {
  return NextResponse.json({
    message: 'Medical OpenAI API endpoint',
    availableTypes: ['diagnosis', 'prescription', 'soap', 'analytics'],
    usage: 'POST with { query, context?, type? }',
    service: 'SYMFARMIA Medical AI Service (OpenAI) v1.0'
  });
}