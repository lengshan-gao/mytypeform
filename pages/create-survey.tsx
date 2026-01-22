import React, { useState } from 'react'
import { useRouter } from 'next/router'

interface Question {
  id: string
  content: string
  type: string
  options: string[]
}

export default function CreateSurveyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    expiresAt: '',
  })
  
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      content: '您对产品的整体满意度如何？',
      type: 'rating',
      options: []
    },
    {
      id: '2',
      content: '产品功能是否符合您的需求？',
      type: 'rating',
      options: []
    },
  ])

  const handleSurveyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSurvey(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleQuestionChange = (id: string, field: string, value: any) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options]
        newOptions[optionIndex] = value
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const addOption = (questionId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return { ...q, options: [...q.options, ''] }
      }
      return q
    }))
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options]
        newOptions.splice(optionIndex, 1)
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const addQuestion = () => {
    const newId = (questions.length + 1).toString()
    setQuestions(prev => [...prev, {
      id: newId,
      content: `问题 ${newId}`,
      type: 'rating',
      options: []
    }])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter(q => q.id !== id))
    }
  }

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id)
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) {
      return
    }
    
    const newQuestions = [...questions]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newQuestions[index]
    newQuestions[index] = newQuestions[newIndex]
    newQuestions[newIndex] = temp
    
    setQuestions(newQuestions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // 检查是否已登录
    const token = localStorage.getItem('token')
    if (!token) {
      setError('请先登录后再创建问卷')
      setLoading(false)
      
      // 延迟跳转到登录页面
      setTimeout(() => {
        router.push('/login?returnTo=/create-survey')
      }, 2000)
      return
    }
    
    try {
      const response = await fetch('/api/surveys/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...survey,
          questions,
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('问卷创建成功！')
        router.push('/')
      } else {
        setError(result.message || '创建失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#1f2937' }}>创建新问卷</h1>
      
      {error && (
        <div style={{ 
          background: '#fee2e2', 
          border: '1px solid #fecaca', 
          color: '#dc2626', 
          padding: '1rem', 
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>问卷基本信息</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              问卷标题 *
            </label>
            <input
              type="text"
              name="title"
              value={survey.title}
              onChange={handleSurveyChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
              placeholder="请输入问卷标题"
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              问卷描述
            </label>
            <textarea
              name="description"
              value={survey.description}
              onChange={handleSurveyChange}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                resize: 'vertical'
              }}
              placeholder="请输入问卷描述"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              截止时间
            </label>
            <input
              type="datetime-local"
              name="expiresAt"
              value={survey.expiresAt}
              onChange={handleSurveyChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>
        
        <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>问题列表</h2>
            <button
              type="button"
              onClick={addQuestion}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              添加问题
            </button>
          </div>
          
          {questions.map((question, index) => (
            <div key={question.id} style={{ 
              background: 'white', 
              padding: '1rem', 
              borderRadius: '0.375rem', 
              border: '1px solid #e5e7eb',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>问题 {index + 1}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => moveQuestion(question.id, 'up')}
                    disabled={index === 0}
                    style={{
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                      opacity: index === 0 ? 0.5 : 1
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(question.id, 'down')}
                    disabled={index === questions.length - 1}
                    style={{
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      cursor: index === questions.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: index === questions.length - 1 ? 0.5 : 1
                    }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    disabled={questions.length <= 1}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      cursor: questions.length <= 1 ? 'not-allowed' : 'pointer',
                      opacity: questions.length <= 1 ? 0.5 : 1
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  问题内容 *
                </label>
                <input
                  type="text"
                  value={question.content}
                  onChange={(e) => handleQuestionChange(question.id, 'content', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                  placeholder="请输入问题内容"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    问题类型
                  </label>
                  <select
                    value={question.type}
                    onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value)}
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
                    <option value="text">文本题</option>
                  </select>
                </div>
              </div>

              {/* 单选选项配置 */}
              {question.type === 'single_choice' && (
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    选项配置 *
                  </label>
                  <div style={{ 
                    background: '#f9fafb', 
                    padding: '1rem', 
                    borderRadius: '0.375rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{
                          background: '#3b82f6',
                          color: 'white',
                          borderRadius: '50%',
                          width: '1.5rem',
                          height: '1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          flexShrink: 0
                        }}>
                          {optionIndex + 1}
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(question.id, optionIndex, e.target.value)}
                          placeholder={`选项 ${optionIndex + 1}`}
                          required
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(question.id, optionIndex)}
                          disabled={question.options.length <= 2}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            cursor: question.options.length <= 2 ? 'not-allowed' : 'pointer',
                            opacity: question.options.length <= 2 ? 0.5 : 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          删除
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => addOption(question.id)}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        width: '100%'
                      }}
                    >
                      + 添加选项
                    </button>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    至少需要2个选项，最多支持10个选项
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              background: '#6b7280',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {loading ? '创建中...' : '创建问卷'}
          </button>
        </div>
      </form>
    </div>
  )
}