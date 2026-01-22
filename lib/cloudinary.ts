import cloudinary from 'cloudinary'

// 配置 Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret',
  secure: process.env.NODE_ENV === 'production',
})

// 上传选项接口
export interface UploadOptions {
  folder?: string
  public_id?: string
  transformation?: any[]
  tags?: string[]
}

// 上传结果接口
export interface UploadResult {
  public_id: string
  version: number
  signature: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  tags: string[]
  bytes: number
  type: string
  etag: string
  placeholder: boolean
  url: string
  secure_url: string
  original_filename: string
}

// 上传文件到 Cloudinary
export async function uploadImage(
  fileBuffer: Buffer,
  options: UploadOptions = {}
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: options.folder || 'survey_images',
        public_id: options.public_id,
        transformation: options.transformation,
        tags: options.tags,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result as UploadResult)
        }
      }
    )

    uploadStream.end(fileBuffer)
  })
}

// 删除 Cloudinary 中的文件
export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

// 生成图片 URL
export function generateImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: number
    format?: string
  } = {}
): string {
  return cloudinary.v2.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || 'fill',
    quality: options.quality || 80,
    format: options.format || 'auto',
    secure: true,
  })
}

// 验证文件类型
export function validateFileType(mimeType: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return allowedTypes.includes(mimeType.toLowerCase())
}

// 验证文件大小
export function validateFileSize(fileSize: number, maxSizeMB: number = 5): boolean {
  const maxSize = maxSizeMB * 1024 * 1024
  return fileSize <= maxSize
}

// 从 Cloudinary URL 中提取 public_id
export function extractPublicIdFromUrl(url: string): string | null {
  const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/
  const match = url.match(regex)
  return match ? match[1] : null
}