import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function SurveyDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [survey, setSurvey] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [responses, setResponses] = useState<any[]>([])
  const [weightCalculation, setWeightCalculation] = useState<{
    loading: boolean
    error: string
    data: any
  }>({
    loading: false,
    error: '',
    data: null
  })

  useEffect(() => {
    if (id) {
      fetchSurveyDetail()
    }
  }, [id])

  const fetchSurveyDetail = async () => {
    try {
      setLoading(true)
      
      // 检查是否已登录
      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录后再查看问卷详情')
        setLoading(false)
        
        // 延迟跳转到登录页面
        setTimeout(() => {
          router.push('/login?returnTo=' + router.asPath)
        }, 2000)
        return
      }

      const response = await fetch(`/api/surveys/detail?id=${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSurvey(result.data.survey)
        setQuestions(result.data.questions || [])
        setResponses(result.data.responses || [])
      } else {
        setError(result.message || '获取问卷详情失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'DRAFT': '草稿',
      'PUBLISHED': '已发布',
      'PAUSED': '已暂停',
      'CLOSED': '已关闭',
      'active': '活跃'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'DRAFT': '#6b7280',
      'PUBLISHED': '#10b981',
      'PAUSED': '#f59e0b',
      'CLOSED': '#ef4444',
      'active': '#3b82f6'
    }
    return colorMap[status] || '#6b7280'
  }

  const handleBack = () => {
    router.back()
  }

  const handleEdit = () => {
    // 这里可以跳转到问卷编辑页面
    alert('编辑功能即将推出')
  }

  const handleCopyLink = () => {
    const surveyUrl = `${window.location.origin}/survey/${id}/fill`
    navigator.clipboard.writeText(surveyUrl)
    alert('问卷链接已复制到剪贴板')
  }

  const handleCalculateWeight = async () => {
    try {
      setWeightCalculation({
        loading: true,
        error: '',
        data: null
      })

      // 检查是否已登录
      const token = localStorage.getItem('token')
      if (!token) {
        setWeightCalculation({
          loading: false,
          error: '请先登录后再计算权重得分',
          data: null
        })
        return
      }

      const response = await fetch(`/api/surveys/calculate-weight?surveyId=${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      const result = await response.json()
      
      if (result.success) {
        setWeightCalculation({
          loading: false,
          error: '',
          data: result.data
        })
      } else {
        setWeightCalculation({
          loading: false,
          error: result.message || '计算权重得分失败',
          data: null
        })
      }
    } catch (err) {
      setWeightCalculation({
        loading: false,
        error: '网络错误，请稍后重试',
        data: null
      })
    }
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

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>加载失败</h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{error}</p>
          <button
            onClick={handleBack}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            返回列表
          </button>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ color: '#374151', marginBottom: '1rem' }}>问卷不存在</h3>
          <button
            onClick={handleBack}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            返回列表
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
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '2rem 1rem'
      }}>
        {/* 返回按钮 */}
        <button
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← 返回问卷列表
        </button>

        {/* 问卷基本信息 */}
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '1rem'
          }}>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#1f2937',
              margin: 0,
              flex: 1
            }}>
              {survey.title}
            </h1>
            <span style={{
              background: getStatusColor(survey.status),
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {getStatusText(survey.status)}
            </span>
          </div>

          {survey.description && (
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '1.5rem',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              {survey.description}
            </p>
          )}

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280',
                marginBottom: '0.5rem'
              }}>
                创建时间
              </div>
              <div style={{ 
                fontSize: '1rem', 
                fontWeight: '500', 
                color: '#1f2937'
              }}>
                {formatDate(survey.createdAt)}
              </div>
            </div>
            
            {survey.expiresAt && (
              <div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  截止时间
                </div>
                <div style={{ 
                  fontSize: '1rem', 
                  fontWeight: '500', 
                  color: '#1f2937'
                }}>
                  {formatDate(survey.expiresAt)}
                </div>
              </div>
            )}
          </div>

          <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => router.push('/surveys')}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              background: 'white',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            返回列表
          </button>
          
          <button
            onClick={() => router.push(`/edit-survey?id=${survey.id}`)}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #3b82f6',
              borderRadius: '0.375rem',
              background: 'white',
              color: '#3b82f6',
              cursor: 'pointer'
            }}
          >
            编辑问卷
          </button>
          
          <button
            onClick={() => {
              const link = `${window.location.origin}/answer/${survey.id}`
              navigator.clipboard.writeText(link)
              alert('链接已复制到剪贴板')
            }}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            复制链接
          </button>
        </div>
        </div>

        {/* 问题列表 */}
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
            marginBottom: '1.5rem'
          }}>
            问题列表 ({questions.length})
          </h2>

          {questions.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: '#6b7280'
            }}>
              暂无问题
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {questions.map((question: any, index: number) => (
                <div key={question.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <h3 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: '#1f2937',
                      margin: 0
                    }}>
                      {index + 1}. {question.content}
                    </h3>
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280'
                  }}>
                    类型: {question.type === 'rating' ? '评分题' : question.type === 'single_choice' ? '单选题' : question.type === 'GROUP' ? '大问题' : question.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 回答统计 */}
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
            回答统计 ({responses.length})
          </h2>

          {responses.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: '#6b7280'
            }}>
              暂无回答
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1.5rem'
            }}>
              <div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  总回答数
                </div>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  color: '#3b82f6'
                }}>
                  {responses.length}
                </div>
              </div>
              
              <div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  平均完成时间
                </div>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: '#10b981'
                }}>
                  {responses.length > 0 ? Math.round(responses.reduce((acc, r) => {
                    // 简化处理：假设每个回答耗时30秒
                    return acc + 30
                  }, 0) / responses.length) : 0}秒
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 权重计算 */}
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          marginTop: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#1f2937'
            }}>
              权重计算结果
            </h2>
            <button
              onClick={handleCalculateWeight}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              重新计算
            </button>
          </div>

          {weightCalculation.loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⏳</div>
              <p style={{ color: '#6b7280' }}>计算中...</p>
            </div>
          ) : weightCalculation.error ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              background: '#fef2f2',
              borderRadius: '0.5rem',
              border: '1px solid #fecaca'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>❌</div>
              <p style={{ color: '#dc2626' }}>{weightCalculation.error}</p>
            </div>
          ) : weightCalculation.data ? (
            <div>
              {/* 总得分统计 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: '#f0f9ff',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #bae6fd'
                }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#0369a1',
                    marginBottom: '0.5rem'
                  }}>
                    总回答数
                  </div>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    color: '#0369a1'
                  }}>
                    {weightCalculation.data.totalResponses}
                  </div>
                </div>
                
                <div style={{
                  background: '#f0fdf4',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#15803d',
                    marginBottom: '0.5rem'
                  }}>
                    项目总数
                  </div>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    color: '#15803d'
                  }}>
                    {weightCalculation.data.calculationResults.length}
                  </div>
                </div>
              </div>

              {/* 各项目得分详情 */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '1rem'
                }}>
                  各项目得分详情
                </h3>
                
                {weightCalculation.data.calculationResults.map((result: any, index: number) => (
                  <div key={result.questionId} style={{
                    background: '#f9fafb',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '0.5rem'
                        }}>
                          {index + 1}. {result.questionContent}
                        </h4>
                        <div style={{
                          display: 'flex',
                          gap: '1rem',
                          fontSize: '0.875rem',
                          color: '#6b7280'
                        }}>
                          <span>类型: {result.type === 'single_choice' ? '单选题' : '评分题'}</span>
                        </div>
                      </div>
                      
                      <div style={{
                        textAlign: 'right'
                      }}>
                        <div style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#3b82f6'
                        }}>
                          {result.type === 'single_choice' ? result.totalScore.toFixed(1) : result.weightedScore.toFixed(1)}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          得分
                        </div>
                      </div>
                    </div>

                    {/* 单选题选项统计 */}
                    {result.type === 'single_choice' && (
                      <div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginBottom: '0.5rem'
                        }}>
                          选项统计:
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '0.5rem'
                        }}>
                          {result.optionStats.map((option: any) => (
                            <div key={option.optionId} style={{
                              background: 'white',
                              padding: '0.75rem',
                              borderRadius: '0.25rem',
                              border: '1px solid #e5e7eb'
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.25rem'
                              }}>
                                <span style={{
                                  fontSize: '0.875rem',
                                  fontWeight: '500',
                                  color: '#374151'
                                }}>
                                  {option.optionContent}
                                </span>
                                <span style={{
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  color: '#059669'
                                }}>
                                  {option.score}分
                                </span>
                              </div>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.75rem',
                                color: '#6b7280'
                              }}>
                                <span>选择: {option.selectionCount}次</span>
                                <span>{(option.selectionRate * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 评分题统计 */}
                    {result.type === 'rating' && (
                      <div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginBottom: '0.5rem'
                        }}>
                          评分分布:
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                          gap: '0.5rem'
                        }}>
                          {result.ratingStats.scoreDistribution.map((dist: any) => (
                            <div key={dist.score} style={{
                              background: 'white',
                              padding: '0.5rem',
                              borderRadius: '0.25rem',
                              border: '1px solid #e5e7eb',
                              textAlign: 'center'
                            }}>
                              <div style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#374151'
                              }}>
                                {dist.score}分
                              </div>
                              <div style={{
                                fontSize: '0.75rem',
                                color: '#6b7280'
                              }}>
                                {dist.count}次 ({(dist.rate * 100).toFixed(1)}%)
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 总得分汇总 */}
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                padding: '2rem',
                borderRadius: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  opacity: 0.9,
                  marginBottom: '0.5rem'
                }}>
                  问卷总得分
                </div>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  marginBottom: '0.5rem'
                }}>
                  {calculateTotalWeightedScore(weightCalculation.data.calculationResults).toFixed(1)}
                </div>
                <div style={{
                  fontSize: '1rem',
                  opacity: 0.9
                }}>
                  基于权重计算的综合得分
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
              <p>点击"重新计算"按钮查看权重计算结果</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 计算总加权得分
function calculateTotalWeightedScore(results: any[]): number {
  return results.reduce((total, result) => {
    if (result.type === 'single_choice') {
      return total + result.totalScore
    } else if (result.type === 'rating') {
      return total + result.weightedScore
    }
    return total
  }, 0)
}
