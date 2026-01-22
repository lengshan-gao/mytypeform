const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSurvey() {
  try {
    const survey = await prisma.survey.findUnique({
      where: { id: 'cmkpal8br0039kq5kzrxibnxr' },
      select: { id: true, title: true, expiresAt: true }
    })
    
    console.log('问卷信息:', survey)
    console.log('过期时间类型:', typeof survey?.expiresAt)
    console.log('过期时间值:', survey?.expiresAt)
    console.log('当前时间:', new Date())
    
    if (survey?.expiresAt) {
      console.log('是否过期:', new Date(survey.expiresAt) < new Date())
    } else {
      console.log('问卷永不过期')
    }
  } catch (error) {
    console.error('查询错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSurvey()