import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: '问卷ID不能为空'
    })
  }

  try {
    // 获取问卷的所有回答记录
    const responses = await prisma.response.findMany({
      where: {
        surveyId: id
      },
      include: {
        question: {
          include: {
            parent: true,
            options: true
          }
        },
        option: true
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    // 转换数据结构，便于前端使用
    const formattedResponses = responses.map(response => ({
      questionId: response.questionId,
      optionId: response.optionId,
      option: {
        score: response.option?.score || 0
      },
      question: {
        content: response.question.content,
        weight: response.question.weight,
        parent: response.question.parent ? {
          content: response.question.parent.content
        } : null
      }
    }))

    return res.status(200).json({
      success: true,
      data: {
        responses: formattedResponses,
        total: formattedResponses.length
      }
    })

  } catch (error: any) {
    console.error('获取问卷回答记录错误:', error)
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}