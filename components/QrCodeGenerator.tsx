'use client'

import { useState, useEffect, useRef } from 'react'
import { FaDownload, FaCopy, FaCheck } from 'react-icons/fa'
import Button from './Button'

interface QrCodeGeneratorProps {
  url: string
  size?: number
  showDownload?: boolean
  showCopy?: boolean
  className?: string
}

export default function QrCodeGenerator({
  url,
  size = 256,
  showDownload = true,
  showCopy = true,
  className = '',
}: QrCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    generateQRCode()
  }, [url, size])

  const generateQRCode = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 动态导入qrcode库（客户端）
      const QRCode = (await import('qrcode')).default
      
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, url, {
          width: size,
          margin: 1,
          color: {
            dark: '#1f2937', // 深色（二维码点）
            light: '#ffffff', // 浅色（背景）
          },
        })
        
        // 将canvas转换为DataURL用于下载
        const dataUrl = canvasRef.current.toDataURL('image/png')
        setQrCodeUrl(dataUrl)
      }
    } catch (err) {
      console.error('生成二维码失败:', err)
      setError('生成二维码失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!qrCodeUrl) return
    
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `qrcode-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyImage = async () => {
    if (!canvasRef.current) return
    
    try {
      // 现代浏览器支持Clipboard API的图片复制
      const blob = await new Promise<Blob | null>((resolve) => {
        canvasRef.current?.toBlob(resolve, 'image/png')
      })
      
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error('复制图片失败:', err)
      // 备用方案：复制URL
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err2) {
        console.error('复制URL也失败:', err2)
      }
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制URL失败:', err)
    }
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* 二维码显示区域 */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">生成二维码中...</p>
            </div>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="border border-gray-200 rounded-lg bg-white"
          style={{ width: size, height: size }}
        />
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
            <div className="text-center p-4">
              <p className="text-red-600 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={generateQRCode}
                className="mt-2"
              >
                重试
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="mt-6 space-y-4 w-full">
        {/* URL显示 */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">问卷链接</p>
          <div className="flex items-center bg-gray-50 rounded-lg p-3">
            <code className="text-xs text-gray-800 truncate flex-1 text-left">
              {url}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyUrl}
              className="ml-2"
            >
              {copied ? <FaCheck className="text-green-600" /> : '复制'}
            </Button>
          </div>
        </div>

        {/* 操作按钮组 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {showDownload && (
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!qrCodeUrl || loading}
              className="flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              下载二维码
            </Button>
          )}
          
          {showCopy && (
            <Button
              variant="outline"
              onClick={handleCopyImage}
              disabled={!qrCodeUrl || loading}
              className="flex items-center justify-center"
            >
              {copied ? (
                <>
                  <FaCheck className="mr-2" />
                  已复制
                </>
              ) : (
                <>
                  <FaCopy className="mr-2" />
                  复制图片
                </>
              )}
            </Button>
          )}
        </div>

        {/* 使用提示 */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">使用提示：</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• 下载二维码图片后，可打印张贴或分享到微信</li>
            <li>• 微信内长按二维码图片即可识别</li>
            <li>• 建议二维码尺寸不小于10×10cm以确保识别率</li>
            <li>• 二维码永久有效，链接不会过期</li>
          </ul>
        </div>

        {/* 微信适配提示 */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <span className="text-green-600 font-bold">微</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">微信适配优化</p>
              <p className="text-xs text-gray-600">
                本二维码已针对微信扫码进行优化，识别速度快，兼容性好。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}