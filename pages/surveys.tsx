import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function SurveysPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [surveys, setSurveys] = useState([])

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    try {
      setLoading(true)
      
      // 检查是否已登录
      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录后再查看问卷列表')
        setLoading(false)
        
        // 延迟跳转到登录页面
        setTimeout(() => {
          router.push('/login?returnTo=/surveys')
        }, 2000)
        return
      }

      const response = await fetch('/api/surveys/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSurveys(result.data.surveys || [])
      } else {
        setError(result.message || '获取问卷列表失败')
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

  const handleCreateSurvey = () => {
    router.push('/create-survey')
  }

  const handleViewSurvey = (survey: any) => {
    // 判断是否为权重问卷，跳转到对应的详情页面
    if (survey.questions?.some((q: any) => q.type === 'PROJECT')) {
      router.push(`/survey-weighted/${survey.id}`)
    } else {
      router.push(`/survey/${survey.id}`)
    }
  }

  const handleEditSurvey = (surveyId: string) => {
    // 跳转到问卷编辑页面
    router.push(`/edit-survey?id=${surveyId}`)
  }

  const handleDeleteSurvey = async (surveyId: string, surveyTitle: string) => {
    if (!confirm(`确定要删除问卷"${surveyTitle}"吗？此操作不可撤销！`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('请先登录')
        router.push('/login')
        return
      }

      const response = await fetch(`/api/surveys/delete?id=${surveyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('问卷删除成功！')
        // 重新加载问卷列表
        fetchSurveys()
      } else {
        alert(result.message || '删除失败')
      }
    } catch (err) {
      alert('删除失败，请稍后重试')
    }
  }

  const handleCopyLink = (surveyId: string, surveyTitle: string, survey: any) => {
    // 检查问卷类型，判断是否是权重问卷
    const isWeightedSurvey = survey.questions?.some((q: any) => q.type === 'PROJECT')
    const link = isWeightedSurvey 
      ? `${window.location.origin}/answer-weighted/${surveyId}`
      : `${window.location.origin}/answer/${surveyId}`
    
    // 使用现代剪贴板API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link)
        .then(() => {
          alert(`问卷"${surveyTitle}"的链接已复制到剪贴板！\n\n链接地址：${link}`)
        })
        .catch(() => {
          // 如果现代API失败，使用传统方法
          copyToClipboardFallback(link, surveyTitle)
        })
    } else {
      // 使用传统方法
      copyToClipboardFallback(link, surveyTitle)
    }
  }

  const copyToClipboardFallback = (text: string, surveyTitle: string) => {
    // 创建临时textarea元素
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    
    try {
      const successful = document.execCommand('copy')
      if (successful) {
        alert(`问卷"${surveyTitle}"的链接已复制到剪贴板！\n\n链接地址：${text}`)
      } else {
        alert('复制失败，请手动复制链接：' + text)
      }
    } catch (err) {
      alert('复制失败，请手动复制链接：' + text)
    }
    
    document.body.removeChild(textarea)
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '2rem 1rem'
      }}>
        {/* 页面标题 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => router.push('/')}
              style={{
                background: '#6b7280',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              ← 返回首页
            </button>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#1f2937',
              margin: 0
            }}>
              我的问卷
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => router.push('/create-weighted-survey')}
              style={{
                background: '#8b5cf6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              ⚖️ 创建权重问卷
            </button>
            <button
              onClick={handleCreateSurvey}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              + 创建新问卷
            </button>
          </div>
        </div>

        {error && (
          <div style={{ 
            background: '#fee2e2', 
            border: '1px solid #fecaca', 
            color: '#dc2626', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {/* 问卷列表 */}
        {surveys.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              还没有创建问卷
            </h3>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '2rem',
              fontSize: '1rem'
            }}>
              选择适合您需求的问卷类型开始收集反馈吧！
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => router.push('/create-weighted-survey')}
                style={{
                  background: '#8b5cf6',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                ⚖️ 创建权重问卷
              </button>
              <button
                onClick={handleCreateSurvey}
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
                + 创建普通问卷
              </button>
            </div>
            <div style={{ marginTop: '2rem', color: '#6b7280', fontSize: '0.875rem' }}>
              <p><strong>权重问卷：</strong> 支持项目-维度-选项层级结构，可配置权重计算得分</p>
              <p><strong>普通问卷：</strong> 支持单选、多选、打分等基础问题类型</p>
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
          }}>
            {surveys.map((survey: any) => (
              <div key={survey.id} style={{
                background: 'white',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                padding: '1.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    margin: 0,
                    flex: 1
                  }}>
                    {survey.title}
                  </h3>
                  <span style={{
                    background: getStatusColor(survey.status),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {getStatusText(survey.status)}
                  </span>
                </div>

                {survey.description && (
                  <p style={{ 
                    color: '#6b7280', 
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}>
                    {survey.description}
                  </p>
                )}

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280',
                      marginBottom: '0.25rem'
                    }}>
                      问题数量
                    </div>
                    <div style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '600', 
                      color: '#1f2937'
                    }}>
                      {survey._count?.questions || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280',
                      marginBottom: '0.25rem'
                    }}>
                      回答数量
                    </div>
                    <div style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '600', 
                      color: '#1f2937'
                    }}>
                      {survey._count?.responses || 0}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280',
                  marginBottom: '1.5rem'
                }}>
                  创建时间: {formatDate(survey.createdAt)}
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => handleViewSurvey(survey)}
                    style={{
                      flex: '1 1 60px',
                      background: '#f3f4f6',
                      color: '#374151',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      minWidth: '60px'
                    }}
                  >
                    查看
                  </button>
                  <button
                    onClick={() => handleEditSurvey(survey.id)}
                    style={{
                      flex: '1 1 60px',
                      background: '#3b82f6',
                      color: 'white',
                      padding: '0.5rem 0.75rem',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      minWidth: '60px'
                    }}
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleCopyLink(survey.id, survey.title, survey)}
                    style={{
                      flex: '1 1 80px',
                      background: '#10b981',
                      color: 'white',
                      padding: '0.5rem 0.75rem',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      minWidth: '80px'
                    }}
                  >
                    复制链接
                  </button>
                  <button
                    onClick={() => handleDeleteSurvey(survey.id, survey.title)}
                    style={{
                      flex: '1 1 60px',
                      background: '#ef4444',
                      color: 'white',
                      padding: '0.5rem 0.75rem',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      minWidth: '60px'
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}