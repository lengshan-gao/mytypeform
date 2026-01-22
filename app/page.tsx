import Link from 'next/link'
import { FaQrcode, FaChartBar, FaImage, FaWeixin } from 'react-icons/fa'

export default function HomePage() {
  const features = [
    {
      icon: <FaQrcode className="h-8 w-8" />,
      title: '微信扫码填写',
      description: '生成专属二维码，微信扫码即可填写，无需下载APP',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: <FaImage className="h-8 w-8" />,
      title: '图片上传支持',
      description: '支持在问题中添加图片，让问卷更生动直观',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: <FaChartBar className="h-8 w-8" />,
      title: '数据统计分析',
      description: '实时统计问卷数据，生成可视化图表，洞察用户反馈',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: <FaWeixin className="h-8 w-8" />,
      title: '微信生态集成',
      description: '完美适配微信浏览器，支持微信登录和分享',
      color: 'bg-green-100 text-green-600',
    },
  ]

  const steps = [
    {
      number: '1',
      title: '创建问卷',
      description: '设置问卷标题、描述，添加问题并配置权重',
    },
    {
      number: '2',
      title: '生成二维码',
      description: '系统自动生成专属二维码，支持微信扫码',
    },
    {
      number: '3',
      title: '分享填写',
      description: '通过微信、链接等方式分享问卷，收集反馈',
    },
    {
      number: '4',
      title: '查看统计',
      description: '实时查看填写进度和数据统计，导出分析报告',
    },
  ]

  return (
    <div className="relative overflow-hidden">
      {/* 英雄区域 */}
      <div className="relative bg-gradient-to-br from-primary-50 to-white py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              专业的在线
              <span className="text-primary-600">调查问卷</span>
              平台
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              支持微信扫码填写、图片上传、数据统计，帮助企业轻松收集用户反馈，
              优化产品和服务决策。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                开始创建问卷
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow transition-all duration-300"
              >
                查看演示
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 功能介绍 */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              核心功能特点
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              专为现代企业设计的问卷系统，满足多样化的数据收集需求
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-card p-6 hover:shadow-card-lg transition-shadow duration-300"
              >
                <div className={`${feature.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 使用步骤 */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              简单四步，轻松上手
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              无需复杂配置，快速创建专业的调查问卷
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl shadow-card p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className="absolute right-0 top-1/2 transform translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA区域 */}
      <div className="py-16 bg-primary-600">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            立即开始创建您的第一个问卷
          </h2>
          <p className="text-primary-100 text-xl mb-10 max-w-2xl mx-auto">
            完全免费试用，无需信用卡，立即体验专业的问卷创建流程
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-primary-600 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              免费注册
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-white border-2 border-white hover:bg-white/10 transition-all duration-300"
            >
              联系销售
            </Link>
          </div>
          <p className="text-primary-200 mt-8 text-sm">
            已有账户？ <Link href="/login" className="text-white font-semibold hover:underline">立即登录</Link>
          </p>
        </div>
      </div>

      {/* 微信适配提示 */}
      <div className="py-8 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <FaWeixin className="h-6 w-6 text-green-400 mr-3" />
              <span className="text-white font-medium">完美适配微信浏览器</span>
            </div>
            <div className="text-gray-400 text-sm">
              支持微信扫码填写，在微信内获得最佳体验。无需下载，扫码即用。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}