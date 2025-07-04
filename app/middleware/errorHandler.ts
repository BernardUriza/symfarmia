import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from './validation'

export type RouteHandler = (
  req: NextRequest,
  context?: Record<string, unknown>
) => Promise<NextResponse>

export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (
    req: NextRequest,
    context?: Record<string, unknown>
  ) => {
    try {
      return await handler(req, context)
    } catch (error: unknown) {
      console.error(error)
      if (error instanceof ValidationError) {
        return NextResponse.json({ error: error.message, details: error.errors }, { status: error.status })
      }
      const message =
        typeof error === 'object' && error && 'message' in error
          ? (error as { message: string }).message
          : 'Internal server error'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }
}
