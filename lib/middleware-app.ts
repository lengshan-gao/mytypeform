import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader, UserPayload } from './auth'

// 认证中间件（App Router）
export async function withAuthApp(handler: (req: NextRequest, user: UserPayload) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const authHeader = req.headers.get('authorization')
      const token = extractTokenFromHeader(authHeader || undefined)
      
      if (!token) {
        return NextResponse.json(
          {
            success: false,
            message: '请先登录',
          },
          { status: 401 }
        )
      }
      
      const user = verifyToken(token)
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: '登录已过期，请重新登录',
          },
          { status: 401 }
        )
      }
      
      return handler(req, user)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        {
          success: false,
          message: '服务器错误',
        },
        { status: 500 }
      )
    }
  }
}

// 错误处理中间件（App Router）
export async function withErrorHandlerApp(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error: any) {
      console.error('API error:', error)
      
      const status = error.status || 500
      const message = error.message || '服务器内部错误'
      const errors = error.errors || undefined
      
      return NextResponse.json(
        {
          success: false,
          message,
          errors,
        },
        { status }
      )
    }
  }
}

// CORS中间件（App Router）
export function withCorsApp(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    // 设置CORS头
    const response = await handler(req)
    
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    )
    
    return response
  }
}

// 处理OPTIONS请求
export async function handleOptions() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    },
  })
}

// 组合中间件
export function composeMiddlewareApp(...middlewares: Function[]) {
  return (handler: Function) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}

// 常用的中间件组合
export const apiHandlerApp = composeMiddlewareApp(
  withCorsApp,
  withErrorHandlerApp
)

export const protectedApiHandlerApp = composeMiddlewareApp(
  withCorsApp,
  withAuthApp,
  withErrorHandlerApp
)