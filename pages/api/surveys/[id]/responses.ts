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
        responseItems: {
          include: {
            question: {
              include: {
                parent: true,
                options: true
              }
            },
            option: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    // 转换数据结构，便于前端使用
    const formattedResponses = responses.flatMap(response => 
      response.responseItems.map(item => ({
        questionId: item.questionId,
        optionId: item.optionId,
        option: {
          score: item.option?.score || 0
        },
        question: {
          content: item.question.content,
          weight: item.question.weight,
          parent: item.question.parent ? {
            content: item.question.parent.content
          } : null
        }
      }))
    )

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