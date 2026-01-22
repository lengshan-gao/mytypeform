import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader, hashPassword } from '@/lib/auth'

// 辅助函数：验证用户身份
function authenticateUser(req: NextApiRequest): { id: string } | null {
  const authHeader = req.headers.authorization
  const token = extractTokenFromHeader(authHeader)
  
  if (!token) {
    return null
  }
  
  const user = verifyToken(token)
  return user
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
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
    
    // 验证用户身份（除了登录注册外的所有API）
    const user = authenticateUser(req)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '请先登录',
      })
    }

    // GET /api/surveys - 获取问卷列表
    if (req.method === 'GET') {
      const { status = 'all', page = '1', limit = '10' } = req.query
      const pageNum = parseInt(page as string) || 1
      const limitNum = parseInt(limit as string) || 10
      const skip = (pageNum - 1) * limitNum

      // 构建查询条件
      const where: any = {
        creatorId: user.id,
      }

      if (status && status !== 'all') {
        where.status = status
      }

      // 获取问卷列表
      const [surveys, total] = await Promise.all([
        prisma.survey.findMany({
          where,
          include: {
            _count: {
              select: {
                questions: true,
                responses: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limitNum,
        }),
        prisma.survey.count({ where }),
      ])

      return res.status(200).json({
        success: true,
        data: {
          surveys,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
      })
    }

    // POST /api/surveys - 创建问卷
    if (req.method === 'POST') {
      const { 
        title, 
        description, 
        expiresAt, 
        status = 'DRAFT',
        questions = [],
        isAnonymous = false,
        isPublic = true,
        maxResponses = null,
      } = req.body

      // 验证输入
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: '问卷标题不能为空',
        })
      }

      // 验证问题数据
      if (questions && !Array.isArray(questions)) {
        return res.status(400).json({
          success: false,
          message: '问题数据格式不正确',
        })
      }

      // 使用事务创建问卷和问题
      const result = await prisma.$transaction(async (tx) => {
        // 创建问卷
        const survey = await tx.survey.create({
          data: {
            title: title.trim(),
            description: description?.trim() || '',
            creatorId: user.id,
            status: status || 'DRAFT',
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            isAnonymous,
            isPublic,
            maxResponses,
          },
        })

        // 批量创建问题（使用循环避免createMany在SQLite中的兼容性问题）
        if (questions.length > 0) {
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i]
            const qData = {
              surveyId: survey.id,
              content: q.content?.trim() || '',
              type: q.type || 'RATING',
              weight: typeof q.weight === 'number' ? q.weight : 1.0,
              imageUrl: q.imageUrl?.trim() || null,
              order: typeof q.order === 'number' ? q.order : i + 1,
            }

            // 验证问题内容
            if (!qData.content) {
              throw new Error('问题内容不能为空')
            }

            await tx.question.create({
              data: qData,
            })
          }
        }

        // 获取创建的问题列表
        const createdQuestions = await tx.question.findMany({
          where: { surveyId: survey.id },
          orderBy: { order: 'asc' },
        })

        return {
          survey,
          questions: createdQuestions,
        }
      })

      return res.status(201).json({
        success: true,
        data: result,
        message: questions.length > 0 ? '问卷和问题创建成功' : '问卷创建成功',
      })
    }

    // 方法不允许
    return res.status(405).json({ 
      success: false, 
      message: '方法不允许' 
    })
  } catch (error: any) {
    console.error('API错误:', error)
    
    // 处理已知错误
    if (error.message === '问题内容不能为空') {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }
    
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}