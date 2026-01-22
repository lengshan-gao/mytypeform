import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/auth'
import { protectedApiHandlerApp } from '@/lib/middleware-app'

// 从URL中提取surveyId
async function getSurveyId(req: NextRequest, user: any, checkOwnership = true) {
  const url = new URL(req.url)
  const pathSegments = url.pathname.split('/')
  const surveyId = pathSegments[pathSegments.indexOf('surveys') + 1]
  
  if (!surveyId) {
    throw new ApiError('问卷ID不能为空', 400)
  }

  if (checkOwnership) {
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

  return { surveyId }
}

// GET /api/surveys/[id] - 获取问卷详情
export async function GET(request: NextRequest) {
  const handler = async (req: NextRequest, user: any) => {
    const { surveyId, survey } = await getSurveyId(req, user)
    
    // 获取问卷详情（包含问题和回答统计）
    const surveyWithDetails = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
    })

    if (!surveyWithDetails) {
      throw new ApiError('问卷不存在', 404)
    }

    return NextResponse.json({
      success: true,
      data: surveyWithDetails,
    })
  }

  return protectedApiHandlerApp(handler)(request)
}

// PUT /api/surveys/[id] - 更新问卷
export async function PUT(request: NextRequest) {
  const handler = async (req: NextRequest, user: any) => {
    const { surveyId } = await getSurveyId(req, user)
    const body = await req.json()
    const { title, description, expiresAt, status } = body

    // 验证输入
    if (title !== undefined && !title.trim()) {
      throw new ApiError('问卷标题不能为空', 400)
    }

    // 更新问卷
    const updatedSurvey = await prisma.survey.update({
      where: { id: surveyId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || '' }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(status !== undefined && { status }),
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedSurvey,
      message: '问卷更新成功',
    })
  }

  return protectedApiHandlerApp(handler)(request)
}

// DELETE /api/surveys/[id] - 删除问卷
export async function DELETE(request: NextRequest) {
  const handler = async (req: NextRequest, user: any) => {
    const { surveyId } = await getSurveyId(req, user)

    // 删除问卷（级联删除问题和回答）
    await prisma.survey.delete({
      where: { id: surveyId },
    })

    return NextResponse.json({
      success: true,
      message: '问卷删除成功',
    })
  }

  return protectedApiHandlerApp(handler)(request)
}