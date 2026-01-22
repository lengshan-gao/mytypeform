import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken, verifyPassword, ApiError } from '@/lib/auth'
import { apiHandlerApp } from '@/lib/middleware-app'

export async function POST(request: NextRequest) {
  const handler = async (req: NextRequest) => {
    const body = await req.json()
    const { email, password } = body

    // 验证输入
    if (!email || !password) {
      throw new ApiError('邮箱和密码不能为空', 400)
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new ApiError('用户不存在或密码错误', 401)
    }

    // 验证密码
    const isValidPassword = await verifyPassword(password, user.password || '')
    if (!isValidPassword) {
      throw new ApiError('用户不存在或密码错误', 401)
    }

    // 生成token
    const token = generateToken({
      id: user.id,
      openid: user.openid || undefined,
      nickname: user.nickname || undefined,
      avatar: user.avatar || undefined,
    })

    return NextResponse.json({
      success: true,
      data: {
        token: token.token,
        expiresAt: token.expiresAt,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
        },
      },
    })
  }

  return apiHandlerApp(handler)(request)
}