import { NextRequest, NextResponse } from 'next/server'
import { llmMetrics } from '@/app/services/llmMetrics'
import { llmCache } from '@/app/services/llmCache'

export async function GET(_request: NextRequest) {
  // Get metrics from the service
  const metrics = llmMetrics.getMetrics()
  const health = llmMetrics.getHealthStatus()
  const cacheStats = llmCache.getStats()

  return NextResponse.json({
    metrics: {
      ...metrics,
      timestamp: new Date().toISOString()
    },
    health,
    cache: cacheStats,
    environment: {
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      maxTokens: process.env.OPENAI_MAX_TOKENS || '4000',
      apiKeyConfigured: !!process.env.OPENAI_API_KEY
    }
  })
}

// Allow CORS for metrics endpoint
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}