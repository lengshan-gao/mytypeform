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
    // 获取问题ID
    const { questionId } = req.query
    if (!questionId || typeof questionId !== 'string') {
      return res.status(400).json({
        success: false,
        message: '问题ID不能为空'
      })
    }

    // 获取问题选项
    const options = await prisma.questionOption.findMany({
      where: {
        questionId: questionId,
      },
      orderBy: {
        order: 'asc',
      },
    })

    return res.status(200).json({
      success: true,
      data: {
        options: options.map(option => ({
          id: option.id,
          content: option.content,
          order: option.order,
        })),
      },
    })
  } catch (error: any) {
    console.error('获取问题选项错误:', error)
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}