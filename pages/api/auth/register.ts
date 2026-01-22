import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { generateToken, hashPassword } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: '方法不允许',
      })
    }

    const { email, password, name } = req.body

    // 验证输入
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: '邮箱、密码和用户名不能为空',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码长度至少6位',
      })
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '该邮箱已被注册',
      })
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

    return res.status(201).json({
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
  } catch (error: any) {
    console.error('注册错误:', error)
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}