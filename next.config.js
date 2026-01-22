/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['res.cloudinary.com', 'thirdwx.qlogo.cn'],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    APP_NAME: 'Survey System',
    APP_VERSION: '0.1.0',
  },
  experimental: {
    // 使用Pages Router解决兼容性问题
    appDir: false,
  },
}

module.exports = nextConfig