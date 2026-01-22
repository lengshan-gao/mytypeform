import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/auth'
import { protectedApiHandlerApp } from '@/lib/middleware-app'

// GET /api/surveys - 获取问卷列表
export async function GET(request: NextRequest) {
  const handler = async (req: NextRequest, user: any) => {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {
      creatorId: user.id,
    }

    if (status && status !== 'all') {
      where.status = status
    }

    // 获取问卷列表
    const [surveys, total] = await Promise.all([
      prisma.survey.findMany({
        where,
        include: {
          _count: {
            select: {
              questions: true,
              responses: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.survey.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        surveys,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  }

  return protectedApiHandlerApp(handler)(request)
}

// POST /api/surveys - 创建问卷（支持批量创建问题）
export async function POST(request: NextRequest) {
  const handler = async (req: NextRequest, user: any) => {
    const body = await req.json()
    const { 
      title, 
      description, 
      expiresAt, 
      status = 'DRAFT',
      questions = [],
      isAnonymous = false,
      isPublic = true,
      maxResponses = null,
    } = body

    // 验证输入
    if (!title || !title.trim()) {
      throw new ApiError('问卷标题不能为空', 400)
    }

    // 验证问题数据
    if (questions && !Array.isArray(questions)) {
      throw new ApiError('问题数据格式不正确', 400)
    }

    // 使用事务创建问卷和问题
    const result = await prisma.$transaction(async (tx) => {
      // 创建问卷
      const survey = await tx.survey.create({
        data: {
          title: title.trim(),
          description: description?.trim() || '',
          creatorId: user.id,
          status: status || 'DRAFT',
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          isAnonymous,
          isPublic,
          maxResponses,
        },
      })

      // 批量创建问题
      if (questions.length > 0) {
        const questionsData = questions.map((q: any, index: number) => ({
          surveyId: survey.id,
          content: q.content?.trim() || '',
          type: q.type || 'RATING',
          weight: typeof q.weight === 'number' ? q.weight : 1.0,
          imageUrl: q.imageUrl?.trim() || null,
          order: typeof q.order === 'number' ? q.order : index + 1,
        }))

        // 验证问题内容
        for (const qData of questionsData) {
          if (!qData.content) {
            throw new ApiError('问题内容不能为空', 400)
          }
        }

        for (const qData of questionsData) {
          await tx.question.create({
            data: qData,
          })
        }
      }

      // 获取创建的问题列表
      const createdQuestions = await tx.question.findMany({
        where: { surveyId: survey.id },
        orderBy: { order: 'asc' },
      })

      return {
        survey,
        questions: createdQuestions,
      }
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: questions.length > 0 ? '问卷和问题创建成功' : '问卷创建成功',
    })
  }

  return protectedApiHandlerApp(handler)(request)
}