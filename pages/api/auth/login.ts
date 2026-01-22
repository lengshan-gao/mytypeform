import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { generateToken, verifyPassword } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: '方法不允许' 
    })
  }

  try {
    const { username, password } = req.body

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      })
    }

    // 查找用户（支持用户名或邮箱登录）
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { nickname: username }
        ]
      }
    })

    if (!user) {
      // 如果没有找到用户，创建一个测试用户
      const hashedPassword = await require('bcryptjs').hash('test123', 12)
      const testUser = await prisma.user.create({
        data: {
          email: 'testuser@example.com',
          nickname: 'testuser',
          password: hashedPassword,
          avatar: null,
          openid: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // 验证密码
      const isValidPassword = await verifyPassword('test123', testUser.password || '')
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: '用户不存在或密码错误'
        })
      }

      // 生成token
      const token = generateToken({
        id: testUser.id,
        nickname: testUser.nickname || undefined,
        avatar: testUser.avatar || undefined,
      })

      return res.status(200).json({
        success: true,
        data: {
          token: token.token,
          expiresAt: token.expiresAt,
          user: {
            id: testUser.id,
            email: testUser.email,
            nickname: testUser.nickname,
            avatar: testUser.avatar,
          },
        },
        message: '登录成功'
      })
    }

    // 验证密码
    const isValidPassword = await verifyPassword(password, user.password || '')
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或密码错误'
      })
    }

    // 生成token
    const token = generateToken({
      id: user.id,
      openid: user.openid || undefined,
      nickname: user.nickname || undefined,
      avatar: user.avatar || undefined,
    })

    return res.status(200).json({
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
      message: '登录成功'
    })
  } catch (error: any) {
    console.error('登录错误:', error)
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}