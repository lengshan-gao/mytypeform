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

    // 获取问卷的项目（顶级问题）
    const projectQuestions = await prisma.question.findMany({
      where: {
        surveyId: surveyId,
        type: 'PROJECT',
        parentId: null, // 顶级项目
      },
      orderBy: {
        order: 'asc',
      },
    })

    // 获取每个项目的维度
    const projects = await Promise.all(
      projectQuestions.map(async (project) => {
        // 获取项目的维度（子问题）
        const dimensionQuestions = await prisma.question.findMany({
          where: {
            surveyId: surveyId,
            type: 'DIMENSION',
            parentId: project.id,
          },
          orderBy: {
            order: 'asc',
          },
        })

        // 获取每个维度的选项
        const dimensions = await Promise.all(
          dimensionQuestions.map(async (dimension) => {
            const options = await prisma.questionOption.findMany({
              where: {
                questionId: dimension.id,
              },
              orderBy: {
                order: 'asc',
              },
            })

            return {
              id: dimension.id,
              content: dimension.content,
              weight: dimension.weight,
              options: options.map(option => ({
                id: option.id,
                content: option.content,
                score: option.score,
              })),
            }
          })
        )

        return {
          id: project.id,
          content: project.content,
          imageUrl: project.imageUrl || null, // 包含项目图片
          dimensions,
        }
      })
    )

    return res.status(200).json({
      success: true,
      data: {
        survey,
        projects,
      },
    })
  } catch (error: any) {
    console.error('获取权重计算问卷错误:', error)
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}