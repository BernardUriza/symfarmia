import { NextResponse } from 'next/server';

export function withErrorHandling(handler) {
  return async (req, ...args) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      console.error(error);
      const message = error.message || 'Internal Server Error';
      const status = error.status || 500;
      return NextResponse.json({ error: message }, { status });
    }
  };
}

export function validateBody(fields, handler) {
  return async (req, ...args) => {
    const body = await req.json();
    for (const field of fields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
      }
    }
    req.validatedBody = body;
    return handler(req, ...args);
  };
}
