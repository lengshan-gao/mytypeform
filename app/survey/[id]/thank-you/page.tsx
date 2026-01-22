'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FaCheckCircle, FaShareAlt, FaQrcode, FaDownload, FaHome } from 'react-icons/fa'
import Button from '@/components/Button'
import Card from '@/components/Card'

export default function ThankYouPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string
  
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // 生成分享链接
    const url = `${window.location.origin}/survey/${surveyId}`
    setShareUrl(url)
    
    // 模拟数据提交成功后的处理
    // 这里可以调用API记录提交完成等
  }, [surveyId])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const handleShareWechat = () => {
    // 微信分享逻辑
    alert('请使用微信扫描二维码分享')
  }

  const handleDownloadReport = () => {
    // 下载报告逻辑
    alert('报告下载功能开发中')
  }

  const handleCreateNewSurvey = () => {
    router.push('/surveys/create')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* 成功图标 */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100">
            <FaCheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            提交成功！
          </h1>
          <p className="mt-3 text-gray-600">
            感谢您花费时间填写问卷，您的反馈对我们非常重要。
          </p>
        </div>

        <Card>
          <div className="space-y-6">
            {/* 分享问卷 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaShareAlt className="mr-2" />
                分享此问卷
              </h3>
              <p className="text-gray-600 mb-4">
                将问卷分享给更多朋友，收集更多有价值的反馈。
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="flex">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 px-4 py-2 border border-r-0 border-gray-300 rounded-l-lg focus:outline-none"
                    />
                    <Button
                      variant="primary"
                      onClick={handleCopyLink}
                      className="rounded-l-none"
                    >
                      {copied ? '已复制' : '复制链接'}
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleShareWechat}
                  className="flex items-center justify-center"
                >
                  <FaQrcode className="mr-2" />
                  微信分享
                </Button>
              </div>
            </div>

            {/* 二维码 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaQrcode className="mr-2" />
                问卷二维码
              </h3>
              <p className="text-gray-600 mb-4">
                扫描二维码即可填写问卷，适合打印张贴或分享到微信。
              </p>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="h-64 w-64 bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <p className="text-gray-500">问卷二维码</p>
                    <p className="text-sm text-gray-400">（二维码生成功能）</p>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">使用说明</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• 长按保存二维码图片</li>
                        <li>• 分享到微信聊天或朋友圈</li>
                        <li>• 打印张贴在活动现场</li>
                        <li>• 嵌入到公众号文章中</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">填写统计</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-blue-600">今日填写</p>
                          <p className="text-2xl font-bold text-blue-700">24</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-green-600">总填写数</p>
                          <p className="text-2xl font-bold text-green-700">156</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 数据分析 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaDownload className="mr-2" />
                数据分析
              </h3>
              <p className="text-gray-600 mb-4">
                查看问卷的详细统计数据和下载分析报告。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/survey/${surveyId}/stats`)}
                >
                  查看统计图表
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadReport}
                >
                  下载Excel报告
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadReport}
                >
                  下载PDF报告
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* 下一步操作 */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-6 text-center">
            接下来做什么？
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-xl hover:border-primary-300 transition-colors">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <FaHome className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">返回首页</h4>
              <p className="text-gray-600 text-sm mb-4">
                返回问卷系统首页，查看更多功能
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                返回首页
              </Button>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-xl hover:border-primary-300 transition-colors">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <FaQrcode className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">创建新问卷</h4>
              <p className="text-gray-600 text-sm mb-4">
                立即创建新的调查问卷，收集更多反馈
              </p>
              <Button
                variant="primary"
                onClick={handleCreateNewSurvey}
                className="w-full"
              >
                创建新问卷
              </Button>
            </div>
          </div>
        </Card>

        {/* 温馨提示 */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            问卷数据会在24小时内完成分析，您可以在"我的问卷"页面查看详细统计。
          </p>
          <p className="text-sm text-gray-500 mt-1">
            如有任何问题，请联系我们的客服支持。
          </p>
        </div>
      </div>
    </div>
  )
}