import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <title>调查问卷系统 - Survey System</title>
        <meta name="description" content="专业的在线调查问卷平台，支持微信扫码填写和图片上传" />
        <meta name="keywords" content="问卷,调查,微信,扫码,数据统计" />
        {/* 微信浏览器适配 */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* 禁止电话号码识别 */}
        <meta name="format-detection" content="telephone=no" />
        
        {/* 微信分享相关 */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="调查问卷系统" />
        <meta property="og:description" content="专业的在线调查问卷平台" />
        <meta property="og:image" content="/og-image.png" />
        
        {/* 百度统计或其他分析脚本可在此添加 */}
      </head>
      <body className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="relative min-h-screen">
          {/* 顶部导航栏 */}
          <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold">Q</span>
                </div>
                <span className="text-xl font-bold text-gray-900">问卷系统</span>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="/" className="text-gray-600 hover:text-primary-600 transition-colors">首页</a>
                <a href="/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors">管理</a>
                <a href="/surveys" className="text-gray-600 hover:text-primary-600 transition-colors">问卷</a>
                <a href="/help" className="text-gray-600 hover:text-primary-600 transition-colors">帮助</a>
              </nav>
              <div className="flex items-center space-x-4">
                <button className="btn btn-primary hidden sm:inline-flex">
                  创建问卷
                </button>
                <button className="text-gray-600 hover:text-gray-900">
                  登录
                </button>
              </div>
            </div>
          </header>

          {/* 主内容区域 */}
          <main className="flex-1">
            {children}
          </main>

          {/* 底部页脚 */}
          <footer className="border-t border-gray-200 bg-white py-8">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">问卷系统</h3>
                  <p className="text-gray-600 text-sm">
                    专业的在线调查问卷平台，帮助企业收集反馈，优化决策。
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">产品功能</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="#" className="hover:text-primary-600">问卷创建</a></li>
                    <li><a href="#" className="hover:text-primary-600">图片上传</a></li>
                    <li><a href="#" className="hover:text-primary-600">微信扫码</a></li>
                    <li><a href="#" className="hover:text-primary-600">数据统计</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">帮助支持</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="#" className="hover:text-primary-600">使用指南</a></li>
                    <li><a href="#" className="hover:text-primary-600">常见问题</a></li>
                    <li><a href="#" className="hover:text-primary-600">技术支持</a></li>
                    <li><a href="#" className="hover:text-primary-600">联系我们</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">关注我们</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    关注微信公众号，获取最新功能和使用技巧。
                  </p>
                  <div className="h-32 w-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    微信二维码
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                <p>© 2023 调查问卷系统. 保留所有权利.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}