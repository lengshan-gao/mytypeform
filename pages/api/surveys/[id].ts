import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

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

// 检查问卷所有权
async function checkSurveyOwnership(surveyId: string, userId: string) {
  const survey = await prisma.survey.findFirst({
    where: {
      id: surveyId,
      creatorId: userId,
    },
  })
  
  return survey
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
    
    // 验证用户身份
    const user = authenticateUser(req)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '请先登录',
      })
    }
    
    // 获取surveyId
    const { id: surveyId } = req.query
    if (!surveyId || typeof surveyId !== 'string') {
      return res.status(400).json({
        success: false,
        message: '问卷ID不能为空',
      })
    }
    
    // GET /api/surveys/[id] - 获取问卷详情
    if (req.method === 'GET') {
      // 检查问卷是否存在且属于当前用户
      const survey = await checkSurveyOwnership(surveyId, user.id)
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: '问卷不存在或无权访问',
        })
      }
      
      // 获取问卷详情（包含问题和回答统计）
      const surveyWithDetails = await prisma.survey.findUnique({
        where: { id: surveyId },
        include: {
          questions: {
            orderBy: {
              order: 'asc',
            },
          },
          _count: {
            select: {
              responses: true,
            },
          },
        },
      })

      if (!surveyWithDetails) {
        return res.status(404).json({
          success: false,
          message: '问卷不存在',
        })
      }

      return res.status(200).json({
        success: true,
        data: surveyWithDetails,
      })
    }
    
    // PUT /api/surveys/[id] - 更新问卷
    if (req.method === 'PUT') {
      // 检查问卷是否存在且属于当前用户
      const survey = await checkSurveyOwnership(surveyId, user.id)
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: '问卷不存在或无权访问',
        })
      }
      
      const { title, description, expiresAt, status } = req.body

      // 验证输入
      if (title !== undefined && !title.trim()) {
        return res.status(400).json({
          success: false,
          message: '问卷标题不能为空',
        })
      }

      // 更新问卷
      const updatedSurvey = await prisma.survey.update({
        where: { id: surveyId },
        data: {
          ...(title !== undefined && { title: title.trim() }),
          ...(description !== undefined && { description: description?.trim() || '' }),
          ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
          ...(status !== undefined && { status }),
        },
      })

      return res.status(200).json({
        success: true,
        data: updatedSurvey,
        message: '问卷更新成功',
      })
    }
    
    // DELETE /api/surveys/[id] - 删除问卷
    if (req.method === 'DELETE') {
      // 检查问卷是否存在且属于当前用户
      const survey = await checkSurveyOwnership(surveyId, user.id)
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: '问卷不存在或无权访问',
        })
      }

      // 删除问卷（级联删除问题和回答）
      await prisma.survey.delete({
        where: { id: surveyId },
      })

      return res.status(200).json({
        success: true,
        message: '问卷删除成功',
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
    if (error.code === 'P2025') { // Prisma记录不存在错误
      return res.status(404).json({
        success: false,
        message: '问卷不存在',
      })
    }
    
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}