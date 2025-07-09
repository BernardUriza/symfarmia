import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

const rateMap = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

function checkRateLimit(req) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  const now = Date.now();
  const entry = rateMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) {
    entry.count = 1;
    entry.start = now;
  } else {
    entry.count += 1;
  }
  rateMap.set(ip, entry);
  if (entry.count > MAX_REQUESTS) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  return null;
}

export function withAuth(handler, options = {}) {
  return async (req, ctx) => {
    const limitRes = checkRateLimit(req);
    if (limitRes) return limitRes;
    const session = await getSession(req, req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (options.role && session.user.role !== options.role) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return handler(req, ctx, session);
  };
}
