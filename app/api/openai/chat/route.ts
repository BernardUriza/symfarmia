import { NextResponse } from 'next/server';
import { queryWithFallback } from '@/app/services/openAIFallbackService.js';

export async function POST(request: Request) {
  try {
    const { message, model } = await request.json();
    const result = await queryWithFallback(message, model);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'OpenAI chat endpoint' });
}
