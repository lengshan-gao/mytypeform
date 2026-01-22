// 调试脚本：检查数据库中的权重数据
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugWeights() {
  try {
    console.log('=== 调试权重数据 ===')
    
    // 获取最新的权重问卷
    const latestSurvey = await prisma.survey.findFirst({
      where: {
        questions: {
          some: {
            type: 'PROJECT'
          }
        }
      },
      include: {
        questions: {
          where: {
            OR: [
              { type: 'PROJECT' },
              { type: 'DIMENSION' }
            ]
          },
          include: {
            options: true,
            children: {
              include: {
                options: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    if (!latestSurvey) {
      console.log('没有找到权重问卷')
      return
    }
    
    console.log('问卷标题:', latestSurvey.title)
    console.log('问卷ID:', latestSurvey.id)
    console.log('')
    
    // 检查项目、维度、权重
    const projects = latestSurvey.questions.filter(q => q.type === 'PROJECT')
    
    projects.forEach((project, projectIndex) => {
      console.log(`项目 ${projectIndex + 1}: ${project.content}`)
      console.log('维度权重配置:')
      
      const dimensions = project.children
      dimensions.forEach((dimension, dimIndex) => {
        console.log(`  维度 ${dimIndex + 1}: ${dimension.content}`)
        console.log(`    权重: ${dimension.weight}`)
        console.log(`    选项: ${dimension.options.map(opt => `${opt.score}分`).join(', ')}`)
      })
      
      // 计算权重总和
      const totalWeight = dimensions.reduce((sum, dim) => sum + dim.weight, 0)
      console.log(`  权重总和: ${totalWeight}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('调试错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugWeights()