import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, generateAnonymousUserId } from '@/lib/auth'
import { apiHandlerApp } from '@/lib/middleware-app'
import { withResponseRateLimit } from '@/lib/rate-limit'

// 从URL中提取surveyId
async function getSurveyId(req: NextRequest) {
  const url = new URL(req.url)
  const pathSegments = url.pathname.split('/')
  const surveyIndex = pathSegments.indexOf('surveys')
  const surveyId = pathSegments[surveyIndex + 1]
  
  if (!surveyId) {
    throw new ApiError('问卷ID不能为空', 400)
  }

  // 检查问卷是否存在且已发布
  const survey = await prisma.survey.findFirst({
    where: {
      id: surveyId,
      status: 'PUBLISHED',
    },
    include: {
      questions: true,
    },
  })

  if (!survey) {
    throw new ApiError('问卷不存在或未发布', 404)
  }

  // 检查问卷是否已过期
  if (survey.expiresAt && survey.expiresAt < new Date()) {
    throw new ApiError('问卷已过期', 400)
  }

  return { surveyId, survey }
}

// POST /api/surveys/[id]/responses - 提交问卷回答
export async function POST(request: NextRequest) {
  const handler = async (req: NextRequest) => {
    const { surveyId, survey } = await getSurveyId(req)
    const body = await req.json()
    const { answers, userId: providedUserId } = body

    // 验证输入
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      throw new ApiError('请提供有效的回答数据', 400)
    }

    // 使用提供的userId或生成匿名用户ID
    const userId = providedUserId || generateAnonymousUserId()

    // 验证每个回答
    const validAnswers = []
    for (const answer of answers) {
      const { questionId, score } = answer

      if (!questionId || typeof score !== 'number') {
        continue // 跳过无效回答
      }

      // 检查问题是否存在于此问卷中
      const questionExists = survey.questions.some(q => q.id === questionId)
      if (!questionExists) {
        continue // 跳过不属于此问卷的问题
      }

      // 检查分数是否有效（1-5）
      if (score < 1 || score > 5) {
        continue // 跳过无效分数
      }

      validAnswers.push({ questionId, score })
    }

    if (validAnswers.length === 0) {
      throw new ApiError('没有有效的回答数据', 400)
    }

    // 批量创建回答记录
    const responses = await prisma.$transaction(
      validAnswers.map(answer =>
        prisma.response.upsert({
          where: {
            surveyId_userId_questionId: {
              surveyId,
              userId,
              questionId: answer.questionId,
            },
          },
          update: {
            score: answer.score,
            submittedAt: new Date(),
          },
          create: {
            surveyId,
            userId,
            questionId: answer.questionId,
            score: answer.score,
            submittedAt: new Date(),
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      data: {
        responses,
        userId, // 返回用户ID，用于后续操作或防止重复提交
      },
      message: '问卷提交成功',
    })
  }

  // 应用速率限制和错误处理
  const rateLimitedHandler = withResponseRateLimit(handler)
  return apiHandlerApp(rateLimitedHandler)(request)
}

// GET /api/surveys/[id]/responses - 获取问卷回答统计（需要认证）
export async function GET(request: NextRequest) {
  const handler = async (req: NextRequest, user: any) => {
    const { surveyId } = await getSurveyId(req)
    
    // 检查问卷是否属于当前用户
    const survey = await prisma.survey.findFirst({
      where: {
        id: surveyId,
        creatorId: user.id,
      },
      include: {
        questions: true,
      },
    })

    if (!survey) {
      throw new ApiError('问卷不存在或无权访问', 404)
    }

    // 获取回答统计
    const responses = await prisma.response.findMany({
      where: { surveyId },
      include: {
        question: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    })

    // 计算统计信息
    const totalResponses = responses.length
    const uniqueUsers = new Set(responses.map(r => r.userId)).size
    
    // 按问题分组统计
    const questionStats = await prisma.question.findMany({
      where: { surveyId },
      include: {
        _count: {
          select: { responses: true },
        },
        responses: {
          select: {
            score: true,
          },
        },
      },
    })

    const questionsWithStats = questionStats.map(q => {
      const scores = q.responses.map(r => r.score)
      const averageScore = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0

      return {
        id: q.id,
        content: q.content,
        weight: q.weight,
        totalResponses: q._count.responses,
        averageScore,
        scoreDistribution: [1,2,3,4,5].map(score => ({
          score,
          count: q.responses.filter(r => r.score === score).length,
        })),
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        survey,
        statistics: {
          totalResponses,
          uniqueUsers,
          completionRate: survey.questions.length > 0 
            ? (totalResponses / (uniqueUsers * survey.questions.length)) * 100 
            : 0,
        },
        questions: questionsWithStats,
        responses: responses.slice(0, 50), // 返回最近50条回答
      },
    })
  }

  return apiHandlerApp(handler)(request)
}