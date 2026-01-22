import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

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
    // 解析请求体
    const { surveyId, userId, answers } = req.body

    if (!surveyId) {
      return res.status(400).json({
        success: false,
        message: '问卷ID不能为空'
      })
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '用户ID不能为空'
      })
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: '回答不能为空'
      })
    }

    // 检查问卷是否存在且已发布
    const survey = await prisma.survey.findFirst({
      where: {
        id: surveyId,
        status: {
          in: ['PUBLISHED', 'active']
        },
      },
    })

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: '问卷不存在或未发布'
      })
    }

    // 检查问卷是否已过期
    if (survey.expiresAt && new Date(survey.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: '问卷已过期'
      })
    }

    // 检查是否达到最大回答数限制
    const responseCount = await prisma.response.count({
      where: { surveyId }
    })

    if (survey.maxResponses && responseCount >= survey.maxResponses) {
      return res.status(400).json({
        success: false,
        message: '问卷回答数已达到上限'
      })
    }

    // 检查用户是否已经回答过（如果问卷不允许重复回答）
    if (!survey.isAnonymous) {
      const existingResponse = await prisma.response.findFirst({
        where: {
          surveyId,
          userId,
        },
      })

      if (existingResponse) {
        return res.status(400).json({
          success: false,
          message: '您已经回答过此问卷'
        })
      }
    }

    // 获取问卷的所有问题ID
    const questionIds = (await prisma.question.findMany({
      where: { surveyId },
      select: { id: true }
    })).map(q => q.id)

    // 验证回答的问题是否属于该问卷
    for (const answer of answers) {
      if (!questionIds.includes(answer.questionId)) {
        return res.status(400).json({
          success: false,
          message: '回答的问题不属于该问卷'
        })
      }
    }

    // 开始事务处理，保存所有回答
    const result = await prisma.$transaction(async (tx) => {
      const responseResults = []
      
      for (const answer of answers) {
        const response = await tx.response.create({
          data: {
            surveyId,
            userId,
            questionId: answer.questionId,
            score: answer.score || null,
            optionId: answer.optionId || null,
            textAnswer: answer.textAnswer || null,
            submittedAt: new Date(),
          },
        })
        responseResults.push(response)
      }

      return responseResults
    })

    return res.status(200).json({
      success: true,
      message: '问卷提交成功',
      data: {
        responseCount: result.length,
      },
    })
  } catch (error: any) {
    console.error('提交问卷错误:', error)
    
    if (error.message.includes('Unique constraint failed')) {
      return res.status(400).json({
        success: false,
        message: '您已经回答过此问题'
      })
    }

    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}