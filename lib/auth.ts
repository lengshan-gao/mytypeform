import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { ApiError } from './api'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export interface UserPayload {
  id: string
  openid?: string
  nickname?: string
  avatar?: string
}

export interface AuthToken {
  token: string
  expiresAt: number
}

// 生成JWT令牌
export function generateToken(payload: UserPayload): AuthToken {
  const expiresIn = JWT_EXPIRES_IN
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn })
  const decoded = jwt.decode(token) as { exp: number }
  
  return {
    token,
    expiresAt: decoded.exp * 1000, // 转换为毫秒
  }
}

// 验证JWT令牌
export function verifyToken(token: string): UserPayload | null {
  try {
    // 使用更简单的验证方式
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // 确保返回的对象包含必要的字段
    if (decoded && decoded.id) {
      return {
        id: decoded.id,
        openid: decoded.openid,
        nickname: decoded.nickname,
        avatar: decoded.avatar
      }
    }
    
    return null
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// 密码哈希
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// 验证密码
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// 从请求头中提取token
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// 生成匿名用户ID（用于未登录用户填写问卷）
export function generateAnonymousUserId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 10)
  return `anonymous_${timestamp}_${randomStr}`
}

// 检查用户是否登录（客户端）
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  const token = localStorage.getItem('token')
  if (!token) return false
  
  try {
    const decoded = verifyToken(token)
    return !!decoded
  } catch {
    return false
  }
}

// 获取当前用户信息（客户端）
export function getCurrentUser(): UserPayload | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  const token = localStorage.getItem('token')
  if (!token) return null
  
  return verifyToken(token)
}

// 登录（存储token到localStorage）
export function login(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token)
  }
}

// 登出（移除token）
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
  }
}

// 重新导出ApiError
export { ApiError }