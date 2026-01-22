import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '方法不允许'
    })
  }

  try {
    // 解析表单数据
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB限制
      filename: (name, ext, part, form) => {
        // 生成唯一文件名
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 8)
        return `image_${timestamp}_${random}${ext}`
      }
    })

    const [fields, files] = await form.parse(req)
    
    const imageFile = files.image?.[0]
    
    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      })
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(imageFile.mimetype || '')) {
      // 删除临时文件
      if (fs.existsSync(imageFile.filepath)) {
        fs.unlinkSync(imageFile.filepath)
      }
      return res.status(400).json({
        success: false,
        message: '只支持 JPG、PNG、GIF、WebP 格式的图片'
      })
    }

    // 读取文件内容并转换为Base64
    const imageBuffer = fs.readFileSync(imageFile.filepath)
    const base64Image = imageBuffer.toString('base64')
    
    // 根据MIME类型确定data URL前缀
    const mimeType = imageFile.mimetype || 'image/jpeg'
    const dataUrl = `data:${mimeType};base64,${base64Image}`
    
    // 删除临时文件
    if (fs.existsSync(imageFile.filepath)) {
      fs.unlinkSync(imageFile.filepath)
    }

    return res.status(200).json({
      success: true,
      data: {
        imageUrl: dataUrl, // 返回Base64格式的data URL
        filename: imageFile.originalFilename || 'image',
        size: imageFile.size,
        mimeType: mimeType
      },
      message: '图片上传成功'
    })

  } catch (error: any) {
    console.error('图片上传错误:', error)
    
    // 清理临时文件
    try {
      if (error.filepath && fs.existsSync(error.filepath)) {
        fs.unlinkSync(error.filepath)
      }
    } catch (cleanupError) {
      console.error('清理临时文件失败:', cleanupError)
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '图片大小不能超过5MB'
      })
    }
    
    return res.status(500).json({
      success: false,
      message: '图片上传失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}