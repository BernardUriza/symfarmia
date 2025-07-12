import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Configuración requerida para Netlify
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;


const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      sessionId,
      event,
      specialty,
      location,
      metadata
    } = body;

    // Validate required fields
    if (!sessionId || !event) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, event' },
        { status: 400 }
      );
    }

    // Get user info from headers
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    
    // Anonymize IP (keep only first 3 octets for privacy)
    const rawIp = forwardedFor?.split(',')[0] || realIp || 'unknown';
    const anonymizedIp = rawIp.split('.').slice(0, 3).join('.') + '.0';

    // Save analytics data
    const analyticsRecord = await prisma.consultationAnalytics.create({
      data: {
        sessionId,
        event,
        specialty: specialty || null,
        location: location || null,
        metadata: metadata || {},
        userAgent,
        ipAddress: anonymizedIp
      }
    });

    return NextResponse.json({ 
      success: true, 
      id: analyticsRecord.id 
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const event = searchParams.get('event');
    const specialty = searchParams.get('specialty');
    
    let whereClause = {};
    
    if (sessionId) whereClause.sessionId = sessionId;
    if (event) whereClause.event = event;
    if (specialty) whereClause.specialty = specialty;

    const analytics = await prisma.consultationAnalytics.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    // Generate summary stats
    const totalEvents = analytics.length;
    const uniqueSessions = new Set(analytics.map(a => a.sessionId)).size;
    const specialtyBreakdown = analytics.reduce((acc, item) => {
      if (item.specialty) {
        acc[item.specialty] = (acc[item.specialty] || 0) + 1;
      }
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: analytics,
      summary: {
        totalEvents,
        uniqueSessions,
        specialtyBreakdown
      }
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
