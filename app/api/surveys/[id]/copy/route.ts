import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/auth'
import { protectedApiHandlerApp } from '@/lib/middleware-app'

// POST /api/surveys/[id]/copy - 复制问卷
export async function POST(request: NextRequest) {
  const handler = async (req: NextRequest, user: any) => {
    try {
      // 从URL中提取原问卷ID
      const url = new URL(req.url)
      const pathSegments = url.pathname.split('/')
      const surveyIndex = pathSegments.indexOf('surveys')
      const originalSurveyId = pathSegments[surveyIndex + 1]
      
      if (!originalSurveyId) {
        throw new ApiError('问卷ID不能为空', 400)
      }

      // 检查原问卷是否存在且属于当前用户
      const originalSurvey = await prisma.survey.findFirst({
        where: {
          id: originalSurveyId,
          creatorId: user.id,
        },
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!originalSurvey) {
        throw new ApiError('问卷不存在或无权访问', 404)
      }

      // 可选：从请求体中获取新问卷的标题
      const body = await req.json().catch(() => ({}))
      const newTitle = body.title || `${originalSurvey.title} (副本)`

      // 使用事务确保数据一致性
      const result = await prisma.$transaction(async (tx) => {
        // 创建新问卷（状态设为草稿）
        const newSurvey = await tx.survey.create({
          data: {
            title: newTitle,
            description: originalSurvey.description,
            creatorId: user.id,
            status: 'DRAFT', // 复制后设为草稿状态
            expiresAt: originalSurvey.expiresAt,
            isAnonymous: originalSurvey.isAnonymous,
            isPublic: originalSurvey.isPublic,
            maxResponses: originalSurvey.maxResponses,
          },
        })

        // 复制所有问题
        if (originalSurvey.questions.length > 0) {
          for (let i = 0; i < originalSurvey.questions.length; i++) {
            const question = originalSurvey.questions[i]
            await tx.question.create({
              data: {
                surveyId: newSurvey.id,
                content: question.content,
                type: question.type,
                imageUrl: question.imageUrl,
                order: i + 1, // 保持原顺序
              },
            })
          }
        }

        // 获取创建的问题列表
        const newQuestions = await tx.question.findMany({
          where: { surveyId: newSurvey.id },
          orderBy: { order: 'asc' },
        })

        return {
          survey: newSurvey,
          questions: newQuestions,
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          survey: result.survey,
          questions: result.questions,
          message: '问卷复制成功',
        },
      })
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      console.error('问卷复制错误:', error)
      throw new ApiError('问卷复制失败，请稍后重试', 500)
    }
  }

  return protectedApiHandlerApp(handler)(request)
}