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
    // 验证认证头
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      })
    }

    const token = authHeader.substring(7)
    
    // 简化认证
    if (!token || token.length < 50) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      })
    }

    // 查找或创建默认用户
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'test@example.com' },
          { nickname: '测试用户' }
        ]
      }
    })
    
    // 如果用户不存在，创建默认用户
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          nickname: '测试用户',
          password: 'hashed_password', // 简化处理
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    }
    
    const userId = user.id

    const { title, description, expiresAt, projects } = req.body

    // 验证必填字段
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: '问卷标题不能为空'
      })
    }

    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({
        success: false,
        message: '至少需要配置一个项目'
      })
    }

    // 验证每个项目的维度权重总和
    for (const project of projects) {
      const totalWeight = project.dimensions.reduce((sum: number, dim: any) => sum + dim.weight, 0)
      if (Math.abs(totalWeight - 1) > 0.001) {
        return res.status(400).json({
          success: false,
          message: `项目"${project.content}"的维度权重总和必须为1，当前为${totalWeight}`
        })
      }
    }

    // 创建权重计算问卷
    const survey = await prisma.survey.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        creatorId: userId,
        status: 'PUBLISHED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // 创建项目、维度、选项
    for (const [projectIndex, project] of projects.entries()) {
      // 创建项目（作为顶级问题）
      const projectQuestion = await prisma.question.create({
        data: {
          content: project.content,
          type: 'PROJECT',
          order: projectIndex,
          surveyId: survey.id,
          weight: 1, // 项目权重为1
          imageUrl: project.imageUrl || null, // 保存项目图片
          createdAt: new Date(),
        },
      })

      // 创建维度（作为项目的子问题）
      for (const [dimensionIndex, dimension] of project.dimensions.entries()) {
        const dimensionQuestion = await prisma.question.create({
          data: {
            content: dimension.content,
            type: 'DIMENSION',
            order: dimensionIndex,
            surveyId: survey.id,
            parentId: projectQuestion.id, // 关联到项目
            weight: dimension.weight, // 维度权重
            createdAt: new Date(),
          },
        })

        // 创建选项（1分、3分、9分）
        for (const option of dimension.options) {
          await prisma.questionOption.create({
            data: {
              content: option.content,
              score: option.score,
              weight: 1, // 选项权重为1
              order: option.score === 1 ? 0 : option.score === 3 ? 1 : 2,
              questionId: dimensionQuestion.id,
              createdAt: new Date(),
            },
          })
        }
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        survey: {
          id: survey.id,
          title: survey.title,
          description: survey.description,
          status: survey.status,
          expiresAt: survey.expiresAt,
          createdAt: survey.createdAt,
        },
        projects: projects.length,
      },
      message: '权重计算问卷创建成功'
    })
  } catch (error: any) {
    console.error('创建权重计算问卷错误:', error)
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}