const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('开始创建测试数据...')

  // 创建测试用户
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: 'password123', // 在实际应用中应该使用加密密码
      nickname: '测试用户',
      avatar: null,
    },
  })

  console.log('测试用户创建成功:', testUser)

  // 创建测试问卷
  const testSurvey = await prisma.survey.create({
    data: {
      title: '产品满意度调查',
      description: '这是一个测试问卷，用于评估用户对产品的满意度',
      creatorId: testUser.id,
      status: 'PUBLISHED',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
      isAnonymous: true,
      isPublic: true,
      maxResponses: 100,
    },
  })

  console.log('测试问卷创建成功:', testSurvey)

  // 创建测试问题
  const questions = await Promise.all([
    prisma.question.create({
      data: {
        content: '您对产品的整体满意度如何？',
        type: 'rating',
        order: 0,
        surveyId: testSurvey.id,
      },
    }),
    prisma.question.create({
      data: {
        content: '您最喜欢产品的哪个功能？',
        type: 'single_choice',
        order: 1,
        surveyId: testSurvey.id,
      },
    }),
  ])

  console.log('测试问题创建成功:', questions)

  // 为单选题创建选项（包含分值和权重）
  const options = await Promise.all([
    prisma.questionOption.create({
      data: {
        content: '用户界面设计',
        score: 80,
        weight: 1.0,
        order: 0,
        questionId: questions[1].id,
      },
    }),
    prisma.questionOption.create({
      data: {
        content: '功能完整性',
        score: 90,
        weight: 1.2,
        order: 1,
        questionId: questions[1].id,
      },
    }),
    prisma.questionOption.create({
      data: {
        content: '性能表现',
        score: 85,
        weight: 1.1,
        order: 2,
        questionId: questions[1].id,
      },
    }),
    prisma.questionOption.create({
      data: {
        content: '客户服务',
        score: 75,
        weight: 0.9,
        order: 3,
        questionId: questions[1].id,
      },
    }),
  ])

  console.log('测试选项创建成功:', options)

  console.log('测试数据创建完成！')
}

main()
  .catch((e) => {
    console.error('创建测试数据时出错:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })