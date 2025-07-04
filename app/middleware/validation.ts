import { NextRequest } from 'next/server'
import { ZodSchema } from 'zod'

export class ValidationError extends Error {
  status: number
  errors?: Record<string, string[]>
  constructor(message: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ValidationError'
    this.status = 400
    if (errors !== undefined) {
      this.errors = errors
    }
  }
}

export async function validate<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  const body = await req.json()
  const result = schema.safeParse(body)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors as Record<string, string[]>
    throw new ValidationError('Invalid request payload', errors)
  }
  return result.data
}
