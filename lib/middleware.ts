import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken, extractTokenFromHeader, UserPayload } from './auth'

export interface AuthenticatedRequest extends NextApiRequest {
  user?: UserPayload
}

// 认证中间件
export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization
      const token = extractTokenFromHeader(authHeader)
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: '请先登录',
        })
      }
      
      const user = verifyToken(token)
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '登录已过期，请重新登录',
        })
      }
      
      req.user = user
      return handler(req, res)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({
        success: false,
        message: '服务器错误',
      })
    }
  }
}

// 验证中间件（用于请求体验证）
export function validate(schema: any) {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        // 这里可以使用如zod、joi等验证库
        // 目前简单实现，后续可扩展
        await handler(req, res)
      } catch (error) {
        console.error('Validation error:', error)
        return res.status(400).json({
          success: false,
          message: '请求参数错误',
          errors: error instanceof Error ? { general: [error.message] } : undefined,
        })
      }
    }
  }
}

// CORS中间件
export function withCors(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    )
    
    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }
    
    return handler(req, res)
  }
}

// 错误处理中间件
export function withErrorHandler(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res)
    } catch (error) {
      console.error('API error:', error)
      
      const status = (error as any).status || 500
      const message = (error as any).message || '服务器内部错误'
      const errors = (error as any).errors || undefined
      
      return res.status(status).json({
        success: false,
        message,
        errors,
      })
    }
  }
}

// 组合中间件
export function composeMiddleware(...middlewares: Function[]) {
  return (handler: Function) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}

// 常用的中间件组合
export const apiHandler = composeMiddleware(
  withCors,
  withErrorHandler
)

export const protectedApiHandler = composeMiddleware(
  withCors,
  withAuth,
  withErrorHandler
)