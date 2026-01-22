import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AnswerHierarchicalSurveyPage() {
  const router = useRouter()
  const { id: surveyId } = router.query
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [survey, setSurvey] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([]) // 大问题列表
  const [answers, setAnswers] = useState<{[key: string]: string}>({}) // 答案：questionId -> optionId

  useEffect(() => {
    if (surveyId) {
      fetchSurveyData()
    }
  }, [surveyId])

  const fetchSurveyData = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/surveys/public?id=${surveyId}`)
      const result = await response.json()
      
      if (result.success) {
        setSurvey(result.data.survey)
        
        // 过滤出GROUP类型的问题作为大问题
        const groupQuestions = result.data.questions.filter((q: any) => q.type === 'GROUP')
        setGroups(groupQuestions)
        
        // 初始化答案对象
        const initialAnswers: {[key: string]: string} = {}
        
        // 为每个小问题初始化答案
        groupQuestions.forEach((group: any) => {
          group.children.forEach((child: any) => {
            initialAnswers[child.id] = ''
          })
        })
        
        setAnswers(initialAnswers)
      } else {
        setError(result.message || '获取问卷失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError('')
      setSuccess('')

      // 验证必填问题
      for (const group of groups) {
        for (const child of group.children) {
          const answer = answers[child.id]
          if (!answer) {
            setError(`请回答问题：${child.content}`)
            return
          }
        }
      }

      // 生成匿名用户ID
      const anonymousUserId = 'anonymous_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

      // 准备提交数据
      const answerData = []
      for (const group of groups) {
        for (const child of group.children) {
          answerData.push({
            questionId: child.id,
            optionId: answers[child.id],
          })
        }
      }

      const response = await fetch('/api/surveys/submit-hierarchical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyId,
          userId: anonymousUserId,
          answers: answerData,
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSuccess('问卷提交成功！感谢您的参与。')
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        setError(result.message || '提交失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>加载问卷中...</p>
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
        background: '#f8fafc'
      }}>
        <div style={{ 
          textAlign: 'center',
          background: 'white',
          padding: '3rem',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '90%'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#dc2626',
            marginBottom: '1rem'
          }}>
            加载失败
          </h2>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            {error}
          </p>
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
              fontWeight: '500'
            }}
          >
            返回首页
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
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>问卷不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      padding: '2rem 0'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '2rem'
      }}>
        {/* 问卷标题 */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
              fontSize: '1.125rem',
              color: '#6b7280',
              lineHeight: '1.6'
            }}>
              {survey.description}
            </p>
          )}
        </div>

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
            color: '#15803d',
            padding: '1rem',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 大问题列表 */}
          {groups.map((group, groupIndex) => (
            <div key={group.id} style={{
              background: '#f9fafb',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              marginBottom: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  background: '#3b82f6',
                  color: 'white',
                  borderRadius: '50%',
                  width: '2rem',
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  {groupIndex + 1}
                </span>
                {group.content}
              </h2>

              {/* 小问题列表 */}
              {group.children.map((child: any, childIndex: number) => (
                <div key={child.id} style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '0.375rem',
                  marginBottom: '1.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      background: '#10b981',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1.5rem',
                      height: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {childIndex + 1}
                    </span>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: 0
                    }}>
                      {child.content}
                    </h3>
                  </div>

                  {/* 选项列表 */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {child.options.map((option: any) => (
                      <label key={option.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        background: answers[child.id] === option.id ? '#f0f9ff' : 'white',
                        borderColor: answers[child.id] === option.id ? '#3b82f6' : '#d1d5db',
                        transition: 'all 0.2s'
                      }}>
                        <input
                          type="radio"
                          name={`question_${child.id}`}
                          value={option.id}
                          checked={answers[child.id] === option.id}
                          onChange={() => handleAnswerChange(child.id, option.id)}
                          style={{
                            marginRight: '0.75rem',
                            width: '1.25rem',
                            height: '1.25rem',
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{
                            fontSize: '1rem',
                            color: '#374151',
                            fontWeight: '500'
                          }}>
                            {option.content}
                          </span>
                          <div style={{
                            display: 'flex',
                            gap: '1rem',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            marginTop: '0.25rem'
                          }}>
                            <span>分值: {option.score}</span>
                            <span>权重: {option.weight}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* 提交按钮 */}
          <div style={{ textAlign: 'center' }}>
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
              {submitting ? '提交中...' : '提交问卷'}
            </button>
          </div>
        </form>

        {/* 底部信息 */}
        <div style={{
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.875rem',
          marginTop: '2rem'
        }}>
          <p>此问卷由 {survey.creator?.nickname || '匿名用户'} 创建</p>
          {survey.expiresAt && (
            <p>截止时间: {new Date(survey.expiresAt).toLocaleDateString('zh-CN')}</p>
          )}
        </div>
      </div>
    </div>
  )
}