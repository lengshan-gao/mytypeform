import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface ProjectScore {
  projectId: string
  projectName: string
  score: number
}

export default function ThankYouPage() {
  const router = useRouter()
  const { surveyId, projectScores } = router.query
  
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [scores, setScores] = useState<ProjectScore[]>([])
  
  // 解析项目得分数据
  useEffect(() => {
    if (projectScores && typeof projectScores === 'string') {
      try {
        const parsedScores = JSON.parse(projectScores)
        setScores(parsedScores)
      } catch (error) {
        console.error('解析项目得分数据失败:', error)
      }
    }
  }, [projectScores])

  useEffect(() => {
    // 生成分享链接
    if (surveyId) {
      const url = `${window.location.origin}/answer-weighted/${surveyId}`
      setShareUrl(url)
    }
  }, [surveyId])

  const handleCopyLink = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch(() => {
          // 如果现代API失败，使用传统方法
          copyToClipboardFallback(shareUrl)
        })
    } else {
      copyToClipboardFallback(shareUrl)
    }
  }

  const copyToClipboardFallback = (text: string) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    
    try {
      const successful = document.execCommand('copy')
      if (successful) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      alert('复制失败，请手动复制链接：' + text)
    }
    
    document.body.removeChild(textarea)
  }

  const handleCreateNewSurvey = () => {
    router.push('/surveys')
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ 
        maxWidth: '600px', 
        width: '100%', 
        padding: '2rem 1rem'
      }}>
        {/* 成功图标 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            margin: '0 auto',
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            background: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              fontSize: '3rem', 
              color: '#16a34a'
            }}>
              ✓
            </div>
          </div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            评分提交成功！
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1.125rem',
            lineHeight: '1.6'
          }}>
            感谢您花费时间完成权重评分，您的专业反馈对我们非常重要。
          </p>
        </div>

        {/* 卡片区域 */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          padding: '2rem',
          marginTop: '2rem'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem'
          }}>
            {/* 返回首页 */}
            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }} 
              onClick={() => router.push('/')}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6'
                e.currentTarget.style.background = '#f0f9ff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.background = 'white'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                background: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '1.5rem',
                color: '#3b82f6'
              }}>
                🏠
              </div>
              <h4 style={{ 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                返回首页
              </h4>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '0.875rem'
              }}>
                回到问卷系统首页
              </p>
            </div>

            {/* 创建新问卷 */}
            <div style={{
              textAlign: 'center',
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
              onClick={handleCreateNewSurvey}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10b981'
                e.currentTarget.style.background = '#f0fdf4'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.background = 'white'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                background: '#d1fae5',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '1.5rem',
                color: '#10b981'
              }}>
                📋
              </div>
              <h4 style={{ 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                创建新问卷
              </h4>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '0.875rem'
              }}>
                立即创建新的权重问卷
              </p>
            </div>
          </div>

          {/* 分享链接 */}
          {surveyId && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '0.5rem' }}>🔗</span>
                分享此问卷
              </h3>
              <p style={{ 
                color: '#6b7280', 
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                将权重问卷分享给更多专家，收集更多专业评分。
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    background: '#f9fafb'
                  }}
                />
                <button
                  onClick={handleCopyLink}
                  style={{
                    background: copied ? '#10b981' : '#3b82f6',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    minWidth: '80px'
                  }}
                >
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 项目得分柱状图 */}
        {scores.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            padding: '2rem',
            marginTop: '2rem'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              📊 项目得分统计
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem'
            }}>
              {scores.map((project, index) => (
                <div key={project.projectId} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  background: '#f8fafc'
                }}>
                  <h4 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '1rem'
                  }}>
                    {project.projectName}
                  </h4>
                  
                  {/* 柱状图 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    height: '120px',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%'
                    }}>
                      <div style={{
                        width: '40px',
                        height: `${Math.min(project.score * 10, 100)}%`,
                        background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
                        borderRadius: '4px 4px 0 0',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.75rem',
                        paddingBottom: '0.25rem'
                      }}>
                        {project.score.toFixed(1)}
                      </div>
                      <div style={{
                        marginTop: '0.5rem',
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        fontWeight: '500'
                      }}>
                        得分
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f0f9ff',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #bae6fd'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      color: '#0369a1',
                      fontWeight: '500'
                    }}>
                      项目得分
                    </span>
                    <span style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1e40af'
                    }}>
                      {project.score.toFixed(2)} 分
                    </span>
                  </div>
                </div>
              ))}
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
            </div>
          </div>
        )}

        {/* 温馨提示 */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#6b7280'
          }}>
            权重评分数据会在24小时内完成分析，您可以在"我的问卷"页面查看详细统计。
          </p>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#6b7280',
            marginTop: '0.5rem'
          }}>
            如有任何问题，请联系我们的客服支持。
          </p>
        </div>
      </div>
    </div>
  )
}