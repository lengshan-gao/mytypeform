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
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: '问卷ID不能为空'
      })
    }

    // 获取权重问卷详情
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        questions: {
          where: {
            OR: [
              { type: 'PROJECT' },
              { type: 'DIMENSION' }
            ]
          },
          include: {
            options: true,
            children: {
              include: {
                options: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: '问卷不存在'
      })
    }

    // 检查问卷是否过期（只有当expiresAt不为null且早于当前时间时才认为过期）
    if (survey.expiresAt && new Date(survey.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: '问卷已过期'
      })
    }

    // 转换数据结构为项目-维度-选项层级
    const projects = survey.questions
      .filter(q => q.type === 'PROJECT')
      .map(project => ({
        id: project.id,
        content: project.content,
        imageUrl: project.imageUrl || null, // 包含项目图片
        dimensions: project.children.map(dimension => ({
          id: dimension.id,
          content: dimension.content,
          weight: dimension.weight,
          options: dimension.options.map(option => ({
            id: option.id,
            content: option.content,
            score: option.score
          }))
        }))
      }))

    const surveyData = {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      expiresAt: survey.expiresAt,
      projects
    }

    res.status(200).json({
      success: true,
      data: {
        survey: surveyData
      }
    })

  } catch (error) {
    console.error('获取权重问卷详情失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}