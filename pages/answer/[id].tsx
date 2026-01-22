import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AnswerSurveyPage() {
  const router = useRouter()
  const { id: surveyId } = router.query
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [survey, setSurvey] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<{[key: string]: any}>({})

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
        setQuestions(result.data.questions || [])
        
        // 初始化答案对象
        const initialAnswers: {[key: string]: any} = {}
        result.data.questions.forEach((q: any) => {
          if (q.type === 'rating') {
            initialAnswers[q.id] = 3 // 默认3分
          } else if (q.type === 'single_choice') {
            initialAnswers[q.id] = ''
          } else if (q.type === 'multiple_choice') {
            initialAnswers[q.id] = []
          } else {
            initialAnswers[q.id] = ''
          }
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

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError('')
      setSuccess('')

      // 验证必填问题
      for (const question of questions) {
        const answer = answers[question.id]
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          setError(`请回答问题：${question.content}`)
          return
        }
      }

      // 生成匿名用户ID
      const anonymousUserId = 'anonymous_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

      const response = await fetch('/api/surveys/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyId,
          userId: anonymousUserId,
          answers: Object.entries(answers).map(([questionId, answer]) => {
            const question = questions.find(q => q.id === questionId)
            
            // 根据问题类型设置不同的字段
            if (question?.type === 'rating') {
              return {
                questionId,
                score: typeof answer === 'number' ? answer : null,
                textAnswer: null,
                optionId: null,
              }
            } else if (question?.type === 'single_choice') {
              return {
                questionId,
                score: null,
                textAnswer: null,
                optionId: typeof answer === 'string' ? answer : null,
              }
            } else {
              return {
                questionId,
                score: null,
                textAnswer: typeof answer === 'string' ? answer : null,
                optionId: null,
              }
            }
          })
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
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>问卷不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      padding: '2rem 1rem'
    }}>
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto' 
      }}>
        {/* 成功提示 */}
        {success && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#16a34a',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <p style={{ fontSize: '1.125rem', fontWeight: '500' }}>{success}</p>
          </div>
        )}

        {/* 错误提示 */}
        {error && !success && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        {/* 问卷表单 */}
        {!success && (
          <form onSubmit={handleSubmit} style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            {/* 问卷标题 */}
            <div style={{ 
              textAlign: 'center',
              marginBottom: '2rem',
              borderBottom: '2px solid #f3f4f6',
              paddingBottom: '1.5rem'
            }}>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: '700', 
                color: '#1f2937',
                marginBottom: '0.5rem'
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
            </div>

            {/* 问题列表 */}
            <div style={{ marginBottom: '2rem' }}>
              {questions.map((question, index) => (
                <div key={question.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  background: '#f9fafb'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
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
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginRight: '1rem',
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </span>
                    <h3 style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '600', 
                      color: '#1f2937',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {question.content}
                    </h3>
                  </div>

                  {/* 评分题 */}
                  {question.type === 'rating' && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      {[1, 2, 3, 4, 5].map(score => (
                        <label key={score} style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="radio"
                            name={`question_${question.id}`}
                            value={score}
                            checked={answers[question.id] === score}
                            onChange={() => handleAnswerChange(question.id, score)}
                            style={{ display: 'none' }}
                          />
                          <div style={{
                            width: '3rem',
                            height: '3rem',
                            borderRadius: '50%',
                            background: answers[question.id] === score ? '#3b82f6' : '#e5e7eb',
                            color: answers[question.id] === score ? 'white' : '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}>
                            {score}
                          </div>
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            marginTop: '0.25rem'
                          }}>
                            {score === 1 ? '非常不满意' : 
                             score === 2 ? '不满意' :
                             score === 3 ? '一般' :
                             score === 4 ? '满意' : '非常满意'}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* 文本题 */}
                  {question.type === 'text' && (
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="请输入您的回答..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        resize: 'vertical',
                        minHeight: '100px'
                      }}
                    />
                  )}

                  {/* 单选题 */}
                  {question.type === 'single_choice' && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      {question.options && question.options.length > 0 ? (
                        question.options.map((option: any, index: number) => (
                          <label key={option.id || index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            background: answers[question.id] === (option.id || option) ? '#f0f9ff' : 'white',
                            borderColor: answers[question.id] === (option.id || option) ? '#3b82f6' : '#d1d5db',
                            transition: 'all 0.2s'
                          }}>
                            <input
                              type="radio"
                              name={`question_${question.id}`}
                              value={option.id || option}
                              checked={answers[question.id] === (option.id || option)}
                              onChange={() => handleAnswerChange(question.id, option.id || option)}
                              style={{
                                marginRight: '0.75rem',
                                width: '1.25rem',
                                height: '1.25rem',
                                cursor: 'pointer'
                              }}
                            />
                            <span style={{
                              fontSize: '1rem',
                              color: '#374151'
                            }}>
                              {option.content || option}
                            </span>
                          </label>
                        ))
                      ) : (
                        <div style={{
                          padding: '1rem',
                          background: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          color: '#6b7280',
                          textAlign: 'center'
                        }}>
                          暂无选项配置
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

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
        )}

        {/* 底部信息 */}
        <div style={{
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.875rem'
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