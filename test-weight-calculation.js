// 测试权重计算逻辑

// 模拟数据：项目一有5个维度，权重分别为0.1, 0.3, 0.2, 0.2, 0.2
const dimensions = [
  { id: 'A', weight: 0.1, selectedScore: 9 }, // 维度A选择9分
  { id: 'B', weight: 0.3, selectedScore: 3 }, // 维度B选择3分
  { id: 'C', weight: 0.2, selectedScore: 1 }, // 维度C选择1分
  { id: 'D', weight: 0.2, selectedScore: 3 }, // 维度D选择3分
  { id: 'E', weight: 0.2, selectedScore: 9 }  // 维度E选择9分
]

// 正确的计算公式
let correctScore = 0
dimensions.forEach(dim => {
  correctScore += dim.selectedScore * dim.weight
})

console.log('正确的项目得分计算:')
console.log('A: 9 × 0.1 =', 9 * 0.1)
console.log('B: 3 × 0.3 =', 3 * 0.3)
console.log('C: 1 × 0.2 =', 1 * 0.2)
console.log('D: 3 × 0.2 =', 3 * 0.2)
console.log('E: 9 × 0.2 =', 9 * 0.2)
console.log('总计:', correctScore.toFixed(2), '分')

// 当前实现的公式
let currentScore = 0
dimensions.forEach(dim => {
  currentScore += dim.selectedScore * dim.weight
})

console.log('\n当前实现的项目得分:', currentScore.toFixed(2), '分')
console.log('计算是否正确?', Math.abs(correctScore - currentScore) < 0.001 ? '✅ 正确' : '❌ 错误')

// 验证具体计算步骤
console.log('\n详细计算步骤:')
dimensions.forEach(dim => {
  const dimensionScore = dim.selectedScore * dim.weight
  console.log(`维度${dim.id}: ${dim.selectedScore} × ${dim.weight} = ${dimensionScore.toFixed(2)}`)
})