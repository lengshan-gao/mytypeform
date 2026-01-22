import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/auth'
import { protectedApiHandlerApp } from '@/lib/middleware-app'

// 从URL中提取surveyId并验证所有权
async function getSurveyId(req: NextRequest, user: any) {
  const url = new URL(req.url)
  const pathSegments = url.pathname.split('/')
  const surveyIndex = pathSegments.indexOf('surveys')
  const surveyId = pathSegments[surveyIndex + 1]
  
  if (!surveyId) {
    throw new ApiError('问卷ID不能为空', 400)
  }

  // 检查问卷是否存在且属于当前用户
  const survey = await prisma.survey.findFirst({
    where: {
      id: surveyId,
      creatorId: user.id,
    },
  })

  if (!survey) {
    throw new ApiError('问卷不存在或无权访问', 404)
  }

  return { surveyId, survey }
}

// 获取问题并验证所有权
async function getQuestion(questionId: string, surveyId: string, user: any) {
  if (!questionId) {
    throw new ApiError('问题ID不能为空', 400)
  }

  // 检查问题是否存在且属于指定问卷
  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      surveyId,
    },
    include: {
      survey: true,
    },
  })

  if (!question) {
    throw new ApiError('问题不存在或无权访问', 404)
  }

  // 验证问卷属于当前用户
  if (question.survey.creatorId !== user.id) {
    throw new ApiError('无权访问此问题', 403)
  }

  return question
}

// GET /api/surveys/[id]/questions - 获取问题列表
export async function GET(request: NextRequest) {
  const handler = async (req: NextRequest, user: any) => {
    const { surveyId } = await getSurveyId(req, user)
    
    // 获取问题列表
    const questions = await prisma.question.findMany({
      where: { surveyId },
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: questions,
    })
  }

  return protectedApiHandlerApp(handler)(request)
}

// POST /api/surveys/[id]/questions - 添加问题
export async function POST(request: NextRequest) {
  const handler = async (req: NextRequest, user: any) => {
    const { surveyId } = await getSurveyId(req, user)
    const body = await req.json()
    const { content, type = 'RATING', weight = 1.0, imageUrl, order } = body

    // 验证输入
    if (!content || !content.trim()) {
      throw new ApiError('问题内容不能为空', 400)
    }

    // 获取当前最大order值
    const maxOrderQuestion = await prisma.question.findFirst({
      where: { surveyId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const newOrder = order !== undefined ? order : (maxOrderQuestion?.order || 0) + 1

    // 创建问题
    const question = await prisma.question.create({
      data: {
        surveyId,
        content: content.trim(),
        type,
        weight: parseFloat(weight),
        imageUrl: imageUrl?.trim() || null,
        order: newOrder,
      },
    })

    return NextResponse.json({
      success: true,
      data: question,
      message: '问题添加成功',
    })
  }

  return protectedApiHandlerApp(handler)(request)
}

// PUT /api/surveys/[id]/questions/[questionId] - 更新问题
export async function PUT(request: NextRequest) {
  const handler = async (req: NextRequest, user: any) => {
    const { surveyId } = await getSurveyId(req, user)
    
    // 从URL中提取questionId
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/')
    const questionIndex = pathSegments.indexOf('questions')
    const questionId = pathSegments[questionIndex + 1]
    
    if (!questionId) {
      throw new ApiError('问题ID不能为空', 400)
    }

    // 验证问题所有权
    await getQuestion(questionId, surveyId, user)
    
    const body = await req.json()
    const { content, type, weight, imageUrl, order } = body

    // 构建更新数据
    const updateData: any = {}
    if (content !== undefined) {
      if (!content.trim()) {
        throw new ApiError('问题内容不能为空', 400)
      }
      updateData.content = content.trim()
    }
    if (type !== undefined) {
      updateData.type = type
    }
    if (weight !== undefined) {
      updateData.weight = parseFloat(weight)
    }
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl?.trim() || null
    }
    if (order !== undefined) {
      updateData.order = parseInt(order, 10)
    }

    // 更新问题
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: updatedQuestion,
      message: '问题更新成功',
    })
  }

  return protectedApiHandlerApp(handler)(request)
}

// DELETE /api/surveys/[id]/questions/[questionId] - 删除问题
export async function DELETE(request: NextRequest) {
  const handler = async (req: NextRequest, user: any) => {
    const { surveyId } = await getSurveyId(req, user)
    
    // 从URL中提取questionId
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/')
    const questionIndex = pathSegments.indexOf('questions')
    const questionId = pathSegments[questionIndex + 1]
    
    if (!questionId) {
      throw new ApiError('问题ID不能为空', 400)
    }

    // 验证问题所有权
    await getQuestion(questionId, surveyId, user)

    // 检查问题数量，确保至少保留一个问题
    const questionCount = await prisma.question.count({
      where: { surveyId },
    })

    if (questionCount <= 1) {
      throw new ApiError('问卷至少需要一个问题，无法删除', 400)
    }

    // 删除问题
    await prisma.question.delete({
      where: { id: questionId },
    })

    // 重新排序剩余问题
    const remainingQuestions = await prisma.question.findMany({
      where: { surveyId },
      orderBy: { order: 'asc' },
    })

    // 更新order值，使其连续
    for (let i = 0; i < remainingQuestions.length; i++) {
      await prisma.question.update({
        where: { id: remainingQuestions[i].id },
        data: { order: i + 1 },
      })
    }

    return NextResponse.json({
      success: true,
      message: '问题删除成功',
    })
  }

  return protectedApiHandlerApp(handler)(request)
}