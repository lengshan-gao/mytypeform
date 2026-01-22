import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken, hashPassword, ApiError } from '@/lib/auth'
import { apiHandlerApp } from '@/lib/middleware-app'

export async function POST(request: NextRequest) {
  const handler = async (req: NextRequest) => {
    const body = await req.json()
    const { email, password, name } = body

    // 验证输入
    if (!email || !password || !name) {
      throw new ApiError('邮箱、密码和用户名不能为空', 400)
    }

    if (password.length < 6) {
      throw new ApiError('密码长度至少6位', 400)
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new ApiError('该邮箱已被注册', 409)
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname: name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      },
    })

    // 生成token
    const token = generateToken({
      id: user.id,
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