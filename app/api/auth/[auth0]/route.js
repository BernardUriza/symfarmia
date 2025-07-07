import { NextResponse } from 'next/server';

// Temporary Auth0 route - needs proper configuration
export async function GET() {
  return NextResponse.json({ message: 'Auth0 route - needs configuration' });
}