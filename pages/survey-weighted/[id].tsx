import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface ProjectScore {
  projectId: string
  projectName: string
  score: number
}

interface ResponseData {
  questionId: string
  optionId: string
  option: {
    score: number
  }
  question: {
    content: string
    weight: number
    parent: {
      content: string
    } | null
  }
}

// 获取柱状图颜色函数
const getBarColor = (index: number, isLight: boolean = false) => {
  const colors = [
    { main: '#3b82f6', light: '#60a5fa' }, // 蓝色
    { main: '#10b981', light: '#34d399' }, // 绿色
    { main: '#f59e0b', light: '#fbbf24' }, // 黄色
    { main: '#ef4444', light: '#f87171' }, // 红色
    { main: '#8b5cf6', light: '#a78bfa' }, // 紫色
    { main: '#06b6d4', light: '#22d3ee' }, // 青色
    { main: '#f97316', light: '#fdba74' }, // 橙色
    { main: '#84cc16', light: '#a3e635' }  // 青绿色
  ]
  
  const colorIndex = index % colors.length
  return isLight ? colors[colorIndex].light : colors[colorIndex].main
}

export default function SurveyWeightedDetail() {
  const router = useRouter()
  const { id } = router.query
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [survey, setSurvey] = useState<any>(null)
  const [responses, setResponses] = useState<ResponseData[]>([])
  const [projectScores, setProjectScores] = useState<ProjectScore[]>([])

  useEffect(() => {
    if (id) {
      fetchSurveyData()
    }
  }, [id])

  const fetchSurveyData = async () => {
    try {
      setLoading(true)
      
      // 获取权重问卷详情（不需要认证）
      const surveyResponse = await fetch(`/api/surveys/weighted/${id}`)
      const surveyResult = await surveyResponse.json()
      
      if (!surveyResult.success) {
        setError(surveyResult.message || '问卷不存在')
        return
      }
      
      setSurvey(surveyResult.data.survey)
      
      // 获取问卷的回答记录（使用公共API，不需要认证）
      const responsesResponse = await fetch(`/api/surveys/weighted-responses?id=${id}`)
      const responsesResult = await responsesResponse.json()
      
      if (responsesResult.success) {
        setResponses(responsesResult.data.responses || [])
        
        // 重新计算项目得分
        calculateProjectScores(responsesResult.data.responses || [])
      } else {
        // 如果没有回答记录，显示空状态
        setResponses([])
        setProjectScores([])
      }
      
    } catch (err) {
      console.error('获取问卷数据失败:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const calculateProjectScores = (responseData: ResponseData[]) => {
    // 按项目分组计算得分
    const projectMap = new Map<string, { name: string; totalScore: number }>()
    
    responseData.forEach(response => {
      if (response.question.parent) {
        const projectName = response.question.parent.content
        const dimensionScore = response.option.score * response.question.weight
        
        if (projectMap.has(projectName)) {
          const project = projectMap.get(projectName)!
          project.totalScore += dimensionScore
        } else {
          projectMap.set(projectName, {
            name: projectName,
            totalScore: dimensionScore
          })
        }
      }
    })
    
    // 转换为数组格式
    const scores = Array.from(projectMap.entries()).map(([projectName, data], index) => ({
      projectId: `project_${index + 1}`,
      projectName: data.name,
      score: Math.round(data.totalScore * 100) / 100
    }))
    
    setProjectScores(scores)
  }

  const handleRefresh = () => {
    fetchSurveyData()
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#6b7280' }}>加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
          <p style={{ color: '#ef4444' }}>{error || '问卷不存在'}</p>
          <button
            onClick={() => router.push('/surveys')}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              marginTop: '1rem'
            }}
          >
            返回问卷列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '2rem 1rem'
      }}>
        {/* 页面标题和操作 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <button
              onClick={() => router.push('/surveys')}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}
            >
              ← 返回问卷列表
            </button>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#1f2937',
              margin: 0
            }}>
              {survey.title}
            </h1>
            {survey.description && (
              <p style={{ 
                color: '#6b7280', 
                marginTop: '0.5rem',
                fontSize: '1.125rem'
              }}>
                {survey.description}
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            style={{
              background: '#10b981',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            🔄 重新计算
          </button>
        </div>

        {/* 统计信息 */}
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700', 
                color: '#3b82f6'
              }}>
                {responses.length}
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280'
              }}>
                总回答数
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700', 
                color: '#10b981'
              }}>
                {projectScores.length}
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280'
              }}>
                项目数量
              </div>
            </div>
          </div>
        </div>

        {/* 项目得分柱状图 - 多项目对比 */}
        {projectScores.length > 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              📊 项目得分对比图
            </h2>
            
            {/* 多项目柱状图容器 */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              height: '200px',
              gap: '2rem',
              marginBottom: '2rem',
              padding: '0 1rem'
            }}>
              {projectScores.map((project, index) => {
                // 计算柱状图高度（基于最大得分）
                const maxScore = Math.max(...projectScores.map(p => p.score), 10)
                const barHeight = Math.min((project.score / maxScore) * 80, 100)
                
                return (
                  <div key={project.projectId} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    maxWidth: '120px'
                  }}>
                    {/* 柱状图 */}
                    <div style={{
                      width: '60px',
                      height: `${barHeight}%`,
                      background: `linear-gradient(to top, ${getBarColor(index)}, ${getBarColor(index, true)})`,
                      borderRadius: '4px 4px 0 0',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      paddingBottom: '0.5rem',
                      marginBottom: '0.5rem',
                      position: 'relative'
                    }}>
                      {project.score.toFixed(1)}
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '0.75rem',
                        color: '#374151',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        {project.score.toFixed(2)}分
                      </div>
                    </div>
                    
                    {/* 项目名称 */}
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      textAlign: 'center',
                      lineHeight: '1.2',
                      maxWidth: '100px',
                      wordBreak: 'break-word'
                    }}>
                      {project.projectName}
                    </div>
                    
                    {/* 项目序号 */}
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginTop: '0.25rem'
                    }}>
                      项目{index + 1}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* 项目得分详情表格 */}
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              overflow: 'hidden'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{
                    background: '#f8fafc'
                  }}>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      项目名称
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      得分
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      排名
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projectScores
                    .sort((a, b) => b.score - a.score)
                    .map((project, index) => (
                      <tr key={project.projectId} style={{
                        background: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                      }}>
                        <td style={{
                          padding: '1rem',
                          borderBottom: '1px solid #f1f5f9',
                          fontWeight: '500'
                        }}>
                          {project.projectName}
                        </td>
                        <td style={{
                          padding: '1rem',
                          textAlign: 'center',
                          borderBottom: '1px solid #f1f5f9',
                          fontWeight: '600',
                          color: '#1e40af'
                        }}>
                          {project.score.toFixed(2)} 分
                        </td>
                        <td style={{
                          padding: '1rem',
                          textAlign: 'center',
                          borderBottom: '1px solid #f1f5f9',
                          fontWeight: '600',
                          color: index === 0 ? '#dc2626' : index === 1 ? '#f59e0b' : '#6b7280'
                        }}>
                          {index + 1}
                          {index === 0 && ' 🥇'}
                          {index === 1 && ' 🥈'}
                          {index === 2 && ' 🥉'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            
            {/* 得分说明 */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#166534'
            }}>
              <strong>得分计算说明：</strong> 每个项目得分 = Σ(维度选项分数 × 维度权重)
              <br />
              <strong>数据来源：</strong> 实时计算所有回答记录，点击"重新计算"按钮更新最新数据
            </div>
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '3rem',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              暂无回答数据
            </h3>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '2rem'
            }}>
              当前问卷还没有收到任何回答，请分享问卷链接收集数据。
            </p>
            <button
              onClick={() => router.push(`/surveys`)}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '0.75rem 2rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              复制问卷链接
            </button>
          </div>
        )}

        {/* 回答记录 */}
        {responses.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '2rem'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '1.5rem'
            }}>
              📝 回答记录
            </h2>
            
            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto'
            }}>
              {responses.map((response, index) => (
                <div key={index} style={{
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  marginBottom: '0.75rem',
                  background: '#f9fafb'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong style={{ color: '#374151' }}>
                        {response.question.parent?.content || '未知项目'} - {response.question.content}
                      </strong>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: '#6b7280',
                        marginTop: '0.25rem'
                      }}>
                        选择: {response.option.score}分 (权重: {response.question.weight})
                      </div>
                    </div>
                    <div style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      得分: {(response.option.score * response.question.weight).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}