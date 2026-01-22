import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface Option {
  id: string
  content: string
  score: number
}

interface Dimension {
  id: string
  content: string
  weight: number
  options: Option[]
}

interface Project {
  id: string
  content: string
  dimensions: Dimension[]
}

interface SurveyData {
  id: string
  title: string
  description?: string
  expiresAt?: string
  projects: Project[]
}

export default function AnswerWeightedSurvey() {
  const router = useRouter()
  const { id } = router.query
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [survey, setSurvey] = useState<SurveyData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({}) // dimensionId -> optionId
  
  // 图片放大功能状态
  const [enlargedImage, setEnlargedImage] = useState<{
    src: string
    alt: string
  } | null>(null)

  useEffect(() => {
    if (id) {
      fetchSurvey()
    }
  }, [id])

  const fetchSurvey = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/surveys/weighted/${id}`)
      const result = await response.json()
      
      if (result.success) {
        setSurvey(result.data.survey)
      } else {
        setError(result.message || '问卷不存在或已过期')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (dimensionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [dimensionId]: optionId
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!survey) return
    
    // 验证是否所有维度都已选择
    const allDimensions = survey.projects.flatMap(project => project.dimensions)
    const unselectedDimensions = allDimensions.filter(dimension => !answers[dimension.id])
    
    if (unselectedDimensions.length > 0) {
      setError(`请完成所有维度的评分：${unselectedDimensions.map(d => d.content).join('、')}`)
      return
    }
    
    try {
      setSubmitting(true)
      setError('')
      
      const response = await fetch('/api/surveys/submit-weighted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyId: survey.id,
          answers: Object.entries(answers).map(([dimensionId, optionId]) => ({
            dimensionId,
            optionId
          }))
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // 提交成功，跳转到感谢页面并传递项目得分数据
        const encodedScores = encodeURIComponent(JSON.stringify(result.data.projectScores))
        router.push(`/thank-you?surveyId=${survey.id}&projectScores=${encodedScores}`)
      } else {
        setError(result.message || '提交失败，请重试')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const getSelectedOption = (dimensionId: string) => {
    const optionId = answers[dimensionId]
    if (!optionId) return null
    
    // 在所有项目中查找对应的选项
    for (const project of survey?.projects || []) {
      for (const dimension of project.dimensions) {
        if (dimension.id === dimensionId) {
          return dimension.options.find(option => option.id === optionId)
        }
      }
    }
    return null
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
            onClick={() => router.push('/')}
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
            返回首页
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
        {/* 问卷标题 */}
        <div style={{ 
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            {survey.title}
          </h1>
          
          {survey.description && (
            <p style={{ 
              color: '#6b7280', 
              fontSize: '1.125rem',
              lineHeight: '1.6'
            }}>
              {survey.description}
            </p>
          )}
          
          {survey.expiresAt && (
            <div style={{ 
              marginTop: '1rem',
              padding: '0.75rem',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '0.5rem',
              color: '#0369a1'
            }}>
              <strong>截止时间：</strong>
              {new Date(survey.expiresAt).toLocaleDateString('zh-CN')}
            </div>
          )}
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

        {/* 项目-维度树状结构 */}
        <form onSubmit={handleSubmit}>
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
              marginBottom: '2rem'
            }}>
              请对以下项目进行评分
            </h2>

            {survey.projects.map((project, projectIndex) => (
              <div key={project.id} style={{ marginBottom: '2.5rem' }}>
                {/* 项目标题 */}
                <div style={{ 
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '1rem 1.5rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  {project.imageUrl && (
                    <img 
                      src={project.imageUrl} 
                      alt="项目图片"
                      onClick={() => setEnlargedImage({
                        src: project.imageUrl!,
                        alt: `${project.content} - 项目图片`
                      })}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '0.375rem',
                        border: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    />
                  )}
                  <div>
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '600', 
                      color: '#1f2937',
                      margin: 0,
                      marginBottom: '0.25rem'
                    }}>
                      {projectIndex + 1}. {project.content}
                    </h3>
                    {project.imageUrl && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280'
                      }}>
                        📷 已上传项目图片
                      </div>
                    )}
                  </div>
                </div>

                {/* 维度列表 */}
                <div style={{ paddingLeft: '1rem' }}>
                  {project.dimensions.map((dimension, dimensionIndex) => (
                    <div key={dimension.id} style={{ marginBottom: '1.5rem' }}>
                      {/* 维度标题 */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          background: '#3b82f6',
                          color: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          marginRight: '0.75rem'
                        }}>
                          {dimensionIndex + 1}
                        </div>
                        <h4 style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: '500', 
                          color: '#374151',
                          margin: 0
                        }}>
                          {dimension.content}
                        </h4>
                        <span style={{
                          marginLeft: 'auto',
                          fontSize: '0.875rem',
                          color: '#6b7280'
                        }}>
                          权重: {dimension.weight * 100}%
                        </span>
                      </div>

                      {/* 选项选择 */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '0.75rem'
                      }}>
                        {dimension.options.map((option) => {
                          const isSelected = answers[dimension.id] === option.id
                          return (
                            <label key={option.id} style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              padding: '1rem',
                              border: '2px solid',
                              borderColor: isSelected ? '#3b82f6' : '#d1d5db',
                              borderRadius: '0.5rem',
                              background: isSelected ? '#f0f9ff' : 'white',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}>
                              <input
                                type="radio"
                                name={`dimension_${dimension.id}`}
                                value={option.id}
                                checked={isSelected}
                                onChange={() => handleOptionSelect(dimension.id, option.id)}
                                style={{ display: 'none' }}
                              />
                              <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '600',
                                color: isSelected ? '#3b82f6' : '#374151',
                                marginBottom: '0.5rem'
                              }}>
                                {option.score}分
                              </div>
                              <div style={{
                                fontSize: '0.875rem',
                                color: isSelected ? '#3b82f6' : '#6b7280'
                              }}>
                                {option.content}
                              </div>
                            </label>
                          )
                        })}
                      </div>

                      {/* 当前选择显示 */}
                      {getSelectedOption(dimension.id) && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem 1rem',
                          background: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          color: '#0369a1'
                        }}>
                          当前选择: {getSelectedOption(dimension.id)?.score}分 - {getSelectedOption(dimension.id)?.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* 提交按钮 */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: submitting ? '#9ca3af' : '#10b981',
                  color: 'white',
                  padding: '1rem 2rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  minWidth: '200px'
                }}
              >
                {submitting ? '提交中...' : '提交评分'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 图片放大模态框 */}
      {enlargedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setEnlargedImage(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: 'white',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              boxShadow: '0 20px 25px rgba(0, 0, 0, 0.3)',
              animation: 'scaleIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setEnlargedImage(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.25rem',
                zIndex: 10,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'
              }}
            >
              ×
            </button>
            
            {/* 放大后的图片 */}
            <img 
              src={enlargedImage.src} 
              alt={enlargedImage.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
            />
            
            {/* 图片描述 */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '1rem',
              textAlign: 'center',
              fontSize: '0.875rem'
            }}>
              {enlargedImage.alt}
            </div>
          </div>
        </div>
      )}

      {/* 动画样式 */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.8); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
      `}</style>
    </div>
  )
}