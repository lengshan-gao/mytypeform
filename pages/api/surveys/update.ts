import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
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

    // 使用固定的测试用户ID（简化认证）
    const userId = 'cmkm96e2o0000kq88q6njl49p'

    // 解析请求体
    const { surveyId, title, description, expiresAt, status, questions } = req.body

    if (!surveyId) {
      return res.status(400).json({
        success: false,
        message: '问卷ID不能为空'
      })
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '问卷标题不能为空'
      })
    }

    // 检查问卷是否存在且属于当前用户
    const existingSurvey = await prisma.survey.findFirst({
      where: {
        id: surveyId,
        creatorId: userId,
      },
    })

    if (!existingSurvey) {
      return res.status(404).json({
        success: false,
        message: '问卷不存在或无权编辑'
      })
    }

    // 开始事务处理
    const result = await prisma.$transaction(async (tx) => {
      // 更新问卷基本信息
      const updatedSurvey = await tx.survey.update({
        where: { id: surveyId },
        data: {
          title: title.trim(),
          description: description?.trim() || '',
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          status: status || 'DRAFT',
          updatedAt: new Date(),
        },
      })

      // 获取现有的问题列表
      const existingQuestions = await tx.question.findMany({
        where: { surveyId },
      })

      // 创建问题ID映射
      const existingQuestionMap = new Map(existingQuestions.map(q => [q.id, q]))
      const incomingQuestionMap = new Map(questions.map((q: any) => [q.id, q]))

      // 处理问题更新：删除、更新、创建
      const operations = []

      // 删除不存在于新列表中的问题
      for (const existingQuestion of existingQuestions) {
        if (!incomingQuestionMap.has(existingQuestion.id)) {
          operations.push(
            tx.question.delete({
              where: { id: existingQuestion.id }
            })
          )
        }
      }

      // 更新或创建问题
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i]
        
        if (!question.content || question.content.trim().length === 0) {
          throw new Error(`问题 ${i + 1} 的内容不能为空`)
        }

        if (question.id && existingQuestionMap.has(question.id)) {
          // 更新现有问题
          operations.push(
            tx.question.update({
              where: { id: question.id },
              data: {
                content: question.content.trim(),
                type: question.type || 'rating',
                imageUrl: question.imageUrl || null,
                order: i,
              },
            })
          )
        } else {
          // 创建新问题
          operations.push(
            tx.question.create({
              data: {
                content: question.content.trim(),
                type: question.type || 'rating',
                imageUrl: question.imageUrl || null,
                order: i,
                surveyId: surveyId,
                createdAt: new Date(),
              },
            })
          )
        }
      }

      // 执行所有数据库操作
      await Promise.all(operations)

      return { survey: updatedSurvey }
    })

    return res.status(200).json({
      success: true,
      message: '问卷更新成功',
      data: result,
    })
  } catch (error: any) {
    console.error('更新问卷错误:', error)
    
    if (error.message.includes('不能为空')) {
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