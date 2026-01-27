/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Vercel环境优化配置
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  distDir: '.next',
  
  // 图片配置 - Vercel支持图片优化
  images: {
    domains: ['res.cloudinary.com', 'thirdwx.qlogo.cn'],
    formats: ['image/avif', 'image/webp'],
    // Vercel环境启用图片优化
    unoptimized: process.env.VERCEL ? false : true,
  },
  
  // 环境变量
  env: {
    APP_NAME: 'Survey System',
    APP_VERSION: '0.1.0',
  },
  
  // 实验性功能
  experimental: {
    // 使用Pages Router解决兼容性问题
    appDir: false,
  },
  
  // 生产环境优化
  compress: true,
  poweredByHeader: false,
  
  // Vercel特定配置
  trailingSlash: false,
  
  // 安全头设置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig