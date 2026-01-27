const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 开始部署权重问卷系统到腾讯云函数...');

// 检查环境变量文件
if (!fs.existsSync('.env.production')) {
  console.error('❌ 缺少生产环境配置文件 .env.production');
  console.log('💡 请先创建 .env.production 文件并配置数据库连接信息');
  process.exit(1);
}

console.log('📦 安装项目依赖...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ 依赖安装失败:', error.message);
  process.exit(1);
}

console.log('🔧 生成 Prisma 客户端...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Prisma 客户端生成失败:', error.message);
  process.exit(1);
}

console.log('🏗️ 构建 Next.js 应用...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ 应用构建失败:', error.message);
  process.exit(1);
}

console.log('✅ 本地构建完成！');
console.log('📋 下一步操作:');
console.log('1. 配置腾讯云凭证:');
console.log('   serverless credentials set --provider tencent --secret-id YOUR_SECRET_ID --secret-key YOUR_SECRET_KEY');
console.log('');
console.log('2. 部署到云函数:');
console.log('   serverless deploy');
console.log('');
console.log('3. 数据库迁移（在云函数部署后执行）:');
console.log('   npx prisma migrate deploy');
console.log('');
console.log('💡 提示: 请确保 .env.production 中的数据库连接信息正确');