import { NextResponse } from 'next/server';
import { customGPTService } from '@/src/services/customGPTService';

export async function POST(request: Request) {
  try {
    const { assistantId, message } = await request.json();
    const result = await customGPTService.sendMessage(assistantId, message);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Custom GPT chat endpoint' });
}
