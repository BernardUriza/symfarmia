import { LLMAuditResult } from '@/app/types/llm-audit'

interface CacheEntry {
  key: string
  result: LLMAuditResult
  timestamp: number
  ttl: number
}

class LLMResponseCache {
  private cache: Map<string, CacheEntry>
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize = 100, defaultTTL = 15 * 60 * 1000) { // 15 minutes default
    this.cache = new Map()
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  private generateKey(transcript: string, task: string): string {
    // Create a simple hash of the transcript and task
    const content = `${task}:${transcript.slice(0, 100)}:${transcript.length}`
    return btoa(content).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32)
  }

  get(transcript: string, task: string): LLMAuditResult | null {
    const key = this.generateKey(transcript, task)
    const entry = this.cache.get(key)

    if (!entry) return null

    // Check if entry has expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Move to end (LRU)
    this.cache.delete(key)
    this.cache.set(key, entry)

    console.log('[LLMCache] Cache hit for key:', key)
    return entry.result
  }

  set(transcript: string, task: string, result: LLMAuditResult, ttl?: number): void {
    const key = this.generateKey(transcript, task)

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
      console.log('[LLMCache] Evicted oldest entry:', firstKey)
    }

    this.cache.set(key, {
      key,
      result,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })

    console.log('[LLMCache] Cached result for key:', key)
  }

  clear(): void {
    this.cache.clear()
    console.log('[LLMCache] Cache cleared')
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // Would need to track hits/misses for accurate rate
    }
  }
}

// Export singleton instance
export const llmCache = new LLMResponseCache()