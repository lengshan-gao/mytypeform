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
    // 获取问卷ID
    const { id: surveyId } = req.query
    if (!surveyId || typeof surveyId !== 'string') {
      return res.status(400).json({
        success: false,
        message: '问卷ID不能为空'
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
      include: {
        creator: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          }
        },
        _count: {
          select: {
            questions: true,
            responses: true,
          }
        }
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
    if (survey.maxResponses && survey._count.responses >= survey.maxResponses) {
      return res.status(400).json({
        success: false,
        message: '问卷回答数已达到上限'
      })
    }

    // 获取问卷的问题列表（包含层级结构和选项）
    const questions = await prisma.question.findMany({
      where: {
        surveyId: surveyId,
      },
      include: {
        options: {
          orderBy: {
            order: 'asc',
          },
        },
        children: {
          include: {
            options: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })

    return res.status(200).json({
      success: true,
      data: {
        survey,
        questions,
      },
    })
  } catch (error: any) {
    console.error('获取公开问卷错误:', error)
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}