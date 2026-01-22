import { NextApiRequest, NextApiResponse } from 'next'
import { generateToken, verifyToken } from '@/lib/auth'

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
    // 生成测试token
    const testToken = generateToken({
      id: 'test-user-id',
      nickname: 'testuser'
    })

    // 验证token
    const decoded = verifyToken(testToken.token)

    return res.status(200).json({
      success: true,
      data: {
        generatedToken: testToken,
        decodedToken: decoded,
        isValid: !!decoded
      }
    })
  } catch (error: any) {
    console.error('Token测试错误:', error)
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    })
  }
}