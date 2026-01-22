import { NextRequest, NextResponse } from 'next/server'
import { protectedApiHandlerApp } from '@/lib/middleware-app'
import { 
  uploadImage, 
  validateFileType, 
  validateFileSize,
  generateImageUrl 
} from '@/lib/cloudinary'
import { ApiError } from '@/lib/api'

// 文件上传配置
const MAX_FILE_SIZE_MB = 5
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
]

// 上传请求体类型
interface UploadRequest {
  image: File
  folder?: string
  public_id?: string
}

// POST /api/upload/image - 上传图片
export async function POST(request: NextRequest) {
  const handler = async (req: NextRequest, user: any) => {
    try {
      // 检查请求头是否为 multipart/form-data
      const contentType = req.headers.get('content-type') || ''
      if (!contentType.includes('multipart/form-data')) {
        throw new ApiError('请求格式必须是 multipart/form-data', 400)
      }

      // 解析 FormData
      const formData = await req.formData()
      const imageFile = formData.get('image') as File | null
      const folder = formData.get('folder') as string || 'survey_images'
      const publicId = formData.get('public_id') as string | null

      // 验证文件是否存在
      if (!imageFile) {
        throw new ApiError('请上传图片文件', 400)
      }

      // 验证文件类型
      if (!validateFileType(imageFile.type)) {
        throw new ApiError(
          `不支持的文件类型: ${imageFile.type}。只支持 ${ALLOWED_MIME_TYPES.join(', ')}`,
          400
        )
      }

      // 验证文件大小
      if (!validateFileSize(imageFile.size, MAX_FILE_SIZE_MB)) {
        throw new ApiError(
          `文件大小超过限制: ${(imageFile.size / 1024 / 1024).toFixed(2)}MB。最大支持 ${MAX_FILE_SIZE_MB}MB`,
          400
        )
      }

      // 将文件转换为 Buffer
      const fileBuffer = Buffer.from(await imageFile.arrayBuffer())

      // 上传到 Cloudinary
      const uploadResult = await uploadImage(fileBuffer, {
        folder: folder as string,
        public_id: publicId || undefined,
        tags: [`user_${user.id}`, 'survey_system'],
      })

      // 生成优化后的 URL
      const optimizedUrl = generateImageUrl(uploadResult.public_id, {
        width: 800,
        height: 600,
        crop: 'fill',
        quality: 80,
        format: 'auto',
      })

      // 返回上传结果
      return NextResponse.json({
        success: true,
        data: {
          id: uploadResult.public_id,
          url: optimizedUrl,
          originalUrl: uploadResult.secure_url,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          size: uploadResult.bytes,
          uploadedAt: uploadResult.created_at,
          publicId: uploadResult.public_id,
        },
        message: '图片上传成功',
      })
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      console.error('图片上传错误:', error)
      throw new ApiError('图片上传失败，请稍后重试', 500)
    }
  }

  // 使用认证中间件包装处理器
  return protectedApiHandlerApp(handler)(request)
}

// DELETE /api/upload/image - 删除图片
export async function DELETE(request: NextRequest) {
  const handler = async (req: NextRequest, user: any) => {
    try {
      const body = await req.json()
      const { publicId } = body

      if (!publicId) {
        throw new ApiError('请提供图片 publicId', 400)
      }

      // 验证 publicId 格式
      if (typeof publicId !== 'string' || publicId.trim() === '') {
        throw new ApiError('无效的 publicId', 400)
      }

      // 这里可以添加权限验证，确保用户只能删除自己上传的图片
      // 暂时只删除 Cloudinary 中的文件
      const { deleteImage } = await import('@/lib/cloudinary')
      await deleteImage(publicId)

      return NextResponse.json({
        success: true,
        message: '图片删除成功',
      })
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      console.error('图片删除错误:', error)
      throw new ApiError('图片删除失败，请稍后重试', 500)
    }
  }

  return protectedApiHandlerApp(handler)(request)
}

// OPTIONS 请求处理 CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}