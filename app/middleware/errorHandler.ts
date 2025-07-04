import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from './validation'

export type RouteHandler = (req: NextRequest, context?: any) => Promise<NextResponse>

export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      return await handler(req, context)
    } catch (error: any) {
      console.error(error)
      if (error instanceof ValidationError) {
        return NextResponse.json({ error: error.message, details: error.errors }, { status: error.status })
      }
      const message = error?.message || 'Internal server error'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }
}
