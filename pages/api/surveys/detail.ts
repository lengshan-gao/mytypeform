import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: '方法不允许' 
    })
  }

  try {
    // 验证认证头
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      })
    }

    const token = authHeader.substring(7)
    
    // 简化认证：直接验证token格式
    if (!token || token.length < 50) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      })
    }

    // 获取问卷ID
    const { id: surveyId } = req.query
    if (!surveyId || typeof surveyId !== 'string') {
      return res.status(400).json({
        success: false,
        message: '问卷ID不能为空'
      })
    }

    // 检查问卷是否存在
    const survey = await prisma.survey.findFirst({
      where: {
        id: surveyId,
      },
    })

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: '问卷不存在'
      })
    }

    // 获取问卷的问题列表
    const questions = await prisma.question.findMany({
      where: {
        surveyId: surveyId,
      },
      orderBy: {
        order: 'asc',
      },
    })

    // 获取问卷的回答记录
    const responses = await prisma.response.findMany({
      where: {
        surveyId: surveyId,
      },
      include: {
        question: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    })

    return res.status(200).json({
      success: true,
      data: {
        survey,
        questions,
        responses,
      },
    })
  } catch (error: any) {
    console.error('获取问卷详情错误:', error)
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}