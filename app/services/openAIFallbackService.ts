import { medicalAIService } from './MedicalAIService';

export interface FallbackResult {
  message: string;
  modelUsed: string;
  tokensUsed?: number;
  fallbackUsed: boolean;
}

export async function queryWithFallback(prompt: string, model = 'gpt-4o'): Promise<FallbackResult> {
  const payload = {
    model,
    messages: [{ role: 'user', content: prompt }]
  };

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
    const data = await res.json();
    return {
      message: data.choices?.[0]?.message?.content || '',
      modelUsed: model,
      tokensUsed: data.usage?.total_tokens,
      fallbackUsed: false
    };
  } catch (err) {
    const result = await medicalAIService.processQuery({ query: prompt, type: 'diagnosis' });
    return { message: result.response, modelUsed: 'internal', fallbackUsed: true };
  }
}
