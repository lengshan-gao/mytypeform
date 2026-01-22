import { NextRequest } from 'next/server'
import { ApiError } from './api'

// 内存存储用于速率限制
interface RateLimitRecord {
  count: number
  resetTime: number
}

class RateLimiter {
  private store: Map<string, RateLimitRecord> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(
    private windowMs: number = 60 * 1000, // 时间窗口，默认1分钟
    private maxRequests: number = 5 // 最大请求数
  ) {
    // 每小时清理一次过期记录
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 60 * 1000)
  }

  // 检查是否超过限制
  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const record = this.store.get(key)

    if (!record) {
      // 创建新记录
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + this.windowMs,
      }
      this.store.set(key, newRecord)
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: newRecord.resetTime,
      }
    }

    // 检查是否超过时间窗口
    if (now > record.resetTime) {
      // 重置计数
      record.count = 1
      record.resetTime = now + this.windowMs
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: record.resetTime,
      }
    }

    // 检查是否超过最大请求数
    if (record.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      }
    }

    // 增加计数
    record.count++
    return {
      allowed: true,
      remaining: this.maxRequests - record.count,
      resetTime: record.resetTime,
    }
  }

  // 清理过期记录
  private cleanup(): void {
    const now = Date.now()
    this.store.forEach((record, key) => {
      if (now > record.resetTime) {
        this.store.delete(key)
      }
    })
  }

  // 停止清理定时器
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// 全局速率限制器实例
const responseRateLimiter = new RateLimiter(60 * 1000, 5) // 每分钟5次

// 生成速率限制键
function generateRateLimitKey(req: NextRequest, userId?: string): string {
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown'
  
  const surveyId = extractSurveyIdFromUrl(req.url)
  
  // 组合IP、用户ID和问卷ID作为键
  const parts = [
    ip,
    userId || 'anonymous',
    surveyId || 'unknown',
  ].filter(Boolean)
  
  return parts.join(':')
}

// 从URL中提取surveyId
function extractSurveyIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathSegments = urlObj.pathname.split('/')
    const surveyIndex = pathSegments.indexOf('surveys')
    return surveyIndex !== -1 && surveyIndex + 1 < pathSegments.length 
      ? pathSegments[surveyIndex + 1] 
      : null
  } catch {
    return null
  }
}

// 速率限制中间件
export function withRateLimit(
  handler: (req: NextRequest, user?: any) => Promise<any>,
  options?: {
    windowMs?: number
    maxRequests?: number
    identifier?: (req: NextRequest, user?: any) => string
  }
) {
  return async (req: NextRequest, user?: any) => {
    const {
      windowMs = 60 * 1000,
      maxRequests = 5,
      identifier = (req: NextRequest, user?: any) => generateRateLimitKey(req, user?.id)
    } = options || {}

    // 创建或获取速率限制器
    const limiter = new RateLimiter(windowMs, maxRequests)
    
    // 生成键
    const key = identifier(req, user)
    
    // 检查限制
    const result = limiter.check(key)
    
    if (!result.allowed) {
      throw new ApiError(
        `请求过于频繁，请等待 ${Math.ceil((result.resetTime - Date.now()) / 1000)} 秒后再试`,
        429
      )
    }

    // 设置响应头
    const response = await handler(req, user)
    
    if (response instanceof Response) {
      response.headers.set('X-RateLimit-Limit', maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString())
    }

    return response
  }
}

// 专门用于问卷回答提交的速率限制
export function withResponseRateLimit(handler: (req: NextRequest, user?: any) => Promise<any>) {
  return withRateLimit(handler, {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 3, // 每个用户/IP对每个问卷每分钟最多提交3次
    identifier: (req: NextRequest, user?: any) => {
      const ip = req.headers.get('x-forwarded-for') || 
                 req.headers.get('x-real-ip') || 
                 'unknown'
      
      const surveyId = extractSurveyIdFromUrl(req.url)
      const userId = user?.id || 'anonymous'
      
      return `${ip}:${surveyId}:${userId}`
    }
  })
}

// 用于API认证的速率限制
export function withAuthRateLimit(handler: (req: NextRequest, user?: any) => Promise<any>) {
  return withRateLimit(handler, {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 10, // 每个IP每15分钟最多10次认证请求
    identifier: (req: NextRequest) => {
      const ip = req.headers.get('x-forwarded-for') || 
                 req.headers.get('x-real-ip') || 
                 'unknown'
      return `auth:${ip}`
    }
  })
}

// 清理所有速率限制器（用于测试）
export function cleanupRateLimiters(): void {
  // 如果有多个速率限制器实例，这里需要扩展
  responseRateLimiter.dispose()
}