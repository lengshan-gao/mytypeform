import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface Question {
  id: string
  content: string
  type: string
  imageUrl: string
  order: number
  options: string[]
}

export default function EditSurveyPage() {
  const router = useRouter()
  const { id: surveyId } = router.query
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [surveyData, setSurveyData] = useState<{
    title: string
    description: string
    expiresAt: string
    status: string
    questions: Question[]
  }>({
    title: '',
    description: '',
    expiresAt: '',
    status: 'DRAFT',
    questions: []
  })

  useEffect(() => {
    if (surveyId) {
      fetchSurveyData()
    }
  }, [surveyId])

  const fetchSurveyData = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录')
        router.push('/login?returnTo=/edit-survey/' + surveyId)
        return
      }

      const response = await fetch(`/api/surveys/detail?id=${surveyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      const result = await response.json()
      
      if (result.success) {
        const { survey, questions } = result.data
        
        // 获取每个问题的选项
        const questionsWithOptions = await Promise.all(
          questions.map(async (q: any) => {
            const optionsResponse = await fetch(`/api/surveys/question-options?questionId=${q.id}`)
            const optionsResult = await optionsResponse.json()
            return {
              id: q.id,
              content: q.content,
              type: q.type,
              imageUrl: q.imageUrl || '',
              order: q.order,
              options: optionsResult.success ? optionsResult.data.options : []
            }
          })
        )
        
        setSurveyData({
          title: survey.title || '',
          description: survey.description || '',
          expiresAt: survey.expiresAt ? new Date(survey.expiresAt).toISOString().slice(0, 16) : '',
          status: survey.status || 'DRAFT',
          questions: questionsWithOptions
        })
      } else {
        setError(result.message || '获取问卷数据失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSurveyData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleQuestionChange = (index: number, field: string, value: any) => {
    setSurveyData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }))
  }

  const addQuestion = () => {
    setSurveyData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: '',
          content: '',
          type: 'rating',
          imageUrl: '',
          order: prev.questions.length,
          options: []
        }
      ]
    }))
  }

  const removeQuestion = (index: number) => {
    if (surveyData.questions.length <= 1) {
      alert('问卷至少需要一个问题')
      return
    }
    
    setSurveyData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录')
        return
      }

      const response = await fetch('/api/surveys/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          surveyId,
          ...surveyData
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSuccess('问卷更新成功！')
        setTimeout(() => {
          router.push('/surveys')
        }, 1500)
      } else {
        setError(result.message || '更新问卷失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div>加载中...</div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto' 
      }}>
        {/* 头部 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#1f2937' 
          }}>
            编辑问卷
          </h1>
          
          <button
            onClick={() => router.back()}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              background: 'white',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            返回
          </button>
        </div>

        {/* 错误和成功提示 */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#16a34a',
            padding: '1rem',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem'
          }}>
            {success}
          </div>
        )}

        {/* 编辑表单 */}
        <form onSubmit={handleSubmit} style={{
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '2rem'
        }}>
          {/* 问卷基本信息 */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              基本信息
            </h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                问卷标题 *
              </label>
              <input
                type="text"
                name="title"
                value={surveyData.title}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                问卷描述
              </label>
              <textarea
                name="description"
                value={surveyData.description}
                onChange={handleInputChange}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                截止时间
              </label>
              <input
                type="datetime-local"
                name="expiresAt"
                value={surveyData.expiresAt}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                状态
              </label>
              <select
                name="status"
                value={surveyData.status}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              >
                <option value="DRAFT">草稿</option>
                <option value="PUBLISHED">已发布</option>
                <option value="PAUSED">已暂停</option>
                <option value="CLOSED">已关闭</option>
              </select>
            </div>
          </div>

          {/* 问题列表 */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#1f2937'
              }}>
                问题列表 ({surveyData.questions.length})
              </h2>
              
              <button
                type="button"
                onClick={addQuestion}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                添加问题
              </button>
            </div>

            {surveyData.questions.map((question, index) => (
              <div key={index} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1rem',
                background: '#f9fafb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    color: '#1f2937' 
                  }}>
                    问题 {index + 1}
                  </h3>
                  
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    删除
                  </button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    问题内容 *
                  </label>
                  <input
                    type="text"
                    value={question.content}
                    onChange={(e) => handleQuestionChange(index, 'content', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      问题类型
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="rating">评分题</option>
                      <option value="single_choice">单选题</option>
                      <option value="multiple_choice">多选题</option>
                      <option value="text">文本题</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 提交按钮 */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                background: 'white',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              取消
            </button>
            
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? '保存中...' : '保存修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}