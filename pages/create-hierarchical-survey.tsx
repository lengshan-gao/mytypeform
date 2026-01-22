import React, { useState } from 'react'
import { useRouter } from 'next/router'

export default function CreateHierarchicalSurveyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 问卷基本信息
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  
  // 大问题列表
  const [groups, setGroups] = useState<Array<{
    id: string
    content: string
    children: Array<{
      id: string
      content: string
      options: Array<{
        id: string
        content: string
        score: number
        weight: number
      }>
    }>
  }>>([])

  // 添加大问题
  const addGroup = () => {
    const newGroup = {
      id: Date.now().toString(),
      content: '',
      children: []
    }
    setGroups([...groups, newGroup])
  }

  // 删除大问题
  const removeGroup = (groupId: string) => {
    setGroups(groups.filter(group => group.id !== groupId))
  }

  // 添加小问题
  const addChildQuestion = (groupId: string) => {
    const newQuestion = {
      id: Date.now().toString(),
      content: '',
      options: [
        { id: '1', content: '', score: 0, weight: 1.0 },
        { id: '2', content: '', score: 0, weight: 1.0 },
        { id: '3', content: '', score: 0, weight: 1.0 }
      ]
    }
    
    setGroups(groups.map(group => 
      group.id === groupId 
        ? { ...group, children: [...group.children, newQuestion] }
        : group
    ))
  }

  // 删除小问题
  const removeChildQuestion = (groupId: string, questionId: string) => {
    setGroups(groups.map(group => 
      group.id === groupId 
        ? { ...group, children: group.children.filter(child => child.id !== questionId) }
        : group
    ))
  }

  // 更新选项内容
  const updateOptionContent = (groupId: string, questionId: string, optionId: string, content: string) => {
    setGroups(groups.map(group => 
      group.id === groupId 
        ? {
            ...group,
            children: group.children.map(child =>
              child.id === questionId
                ? {
                    ...child,
                    options: child.options.map(option =>
                      option.id === optionId ? { ...option, content } : option
                    )
                  }
                : child
            )
          }
        : group
    ))
  }

  // 更新选项分值
  const updateOptionScore = (groupId: string, questionId: string, optionId: string, score: number) => {
    setGroups(groups.map(group => 
      group.id === groupId 
        ? {
            ...group,
            children: group.children.map(child =>
              child.id === questionId
                ? {
                    ...child,
                    options: child.options.map(option =>
                      option.id === optionId ? { ...option, score } : option
                    )
                  }
                : child
            )
          }
        : group
    ))
  }

  // 更新选项权重
  const updateOptionWeight = (groupId: string, questionId: string, optionId: string, weight: number) => {
    setGroups(groups.map(group => 
      group.id === groupId 
        ? {
            ...group,
            children: group.children.map(child =>
              child.id === questionId
                ? {
                    ...child,
                    options: child.options.map(option =>
                      option.id === optionId ? { ...option, weight } : option
                    )
                  }
                : child
            )
          }
        : group
    ))
  }

  // 验证表单
  const validateForm = () => {
    if (!title.trim()) {
      setError('问卷标题不能为空')
      return false
    }

    if (groups.length === 0) {
      setError('至少需要一个大问题')
      return false
    }

    for (const group of groups) {
      if (!group.content.trim()) {
        setError('大问题内容不能为空')
        return false
      }

      if (group.children.length === 0) {
        setError('每个大问题下至少需要一个小问题')
        return false
      }

      for (const child of group.children) {
        if (!child.content.trim()) {
          setError('小问题内容不能为空')
          return false
        }

        for (const option of child.options) {
          if (!option.content.trim()) {
            setError('选项内容不能为空')
            return false
          }

          if (option.score <= 0) {
            setError('选项分值必须大于0')
            return false
          }

          if (option.weight < 0.1 || option.weight > 2) {
            setError('选项权重必须在0.1到2之间')
            return false
          }
        }
      }
    }

    return true
  }

  // 提交问卷
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录')
        router.push('/login')
        return
      }

      const response = await fetch('/api/surveys/create-hierarchical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          expiresAt: expiresAt || null,
          groups,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('层级问卷创建成功！')
        router.push('/surveys')
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
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          创建层级问卷
        </h1>

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

        <form onSubmit={handleSubmit}>
          {/* 基本信息 */}
          <div style={{
            background: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem'
          }}>
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入问卷标题"
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请输入问卷描述"
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

            <div>
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
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
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

          {/* 大问题配置 */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                大问题配置 ({groups.length})
              </h2>
              <button
                type="button"
                onClick={addGroup}
                style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                + 添加大问题
              </button>
            </div>

            {groups.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6b7280',
                background: '#f9fafb',
                borderRadius: '0.5rem',
                border: '1px dashed #d1d5db'
              }}>
                暂无大问题，点击"添加大问题"开始配置
              </div>
            ) : (
              groups.map((group, groupIndex) => (
                <div key={group.id} style={{
                  background: '#f9fafb',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      大问题 {groupIndex + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeGroup(group.id)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
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
                      大问题内容 *
                    </label>
                    <input
                      type="text"
                      value={group.content}
                      onChange={(e) => {
                        setGroups(groups.map(g => 
                          g.id === group.id ? { ...g, content: e.target.value } : g
                        ))
                      }}
                      placeholder="请输入大问题内容"
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

                  {/* 小问题配置 */}
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        小问题配置 ({group.children.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => addChildQuestion(group.id)}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        + 添加小问题
                      </button>
                    </div>

                    {group.children.map((child, childIndex) => (
                      <div key={child.id} style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '0.375rem',
                        marginBottom: '1rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1rem'
                        }}>
                          <h5 style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#374151'
                          }}>
                            小问题 {childIndex + 1}
                          </h5>
                          <button
                            type="button"
                            onClick={() => removeChildQuestion(group.id, child.id)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            删除
                          </button>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                          }}>
                            小问题内容 *
                          </label>
                          <input
                            type="text"
                            value={child.content}
                            onChange={(e) => {
                              setGroups(groups.map(g => 
                                g.id === group.id 
                                  ? {
                                      ...g,
                                      children: g.children.map(c =>
                                        c.id === child.id ? { ...c, content: e.target.value } : c
                                      )
                                    }
                                  : g
                              ))
                            }}
                            placeholder="请输入小问题内容"
                            required
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.25rem',
                              fontSize: '0.875rem'
                            }}
                          />
                        </div>

                        {/* 选项配置 */}
                        <div>
                          <h6 style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '0.75rem'
                          }}>
                            选项配置 (3个选项)
                          </h6>
                          
                          {child.options.map((option, optionIndex) => (
                            <div key={option.id} style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 100px 100px',
                              gap: '0.5rem',
                              marginBottom: '0.5rem',
                              alignItems: 'end'
                            }}>
                              <div>
                                <label style={{
                                  display: 'block',
                                  fontSize: '0.625rem',
                                  fontWeight: '500',
                                  color: '#6b7280',
                                  marginBottom: '0.25rem'
                                }}>
                                  选项 {optionIndex + 1} 内容 *
                                </label>
                                <input
                                  type="text"
                                  value={option.content}
                                  onChange={(e) => updateOptionContent(group.id, child.id, option.id, e.target.value)}
                                  placeholder="选项内容"
                                  required
                                  style={{
                                    width: '100%',
                                    padding: '0.375rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </div>

                              <div>
                                <label style={{
                                  display: 'block',
                                  fontSize: '0.625rem',
                                  fontWeight: '500',
                                  color: '#6b7280',
                                  marginBottom: '0.25rem'
                                }}>
                                  分值 *
                                </label>
                                <input
                                  type="number"
                                  value={option.score}
                                  onChange={(e) => updateOptionScore(group.id, child.id, option.id, parseFloat(e.target.value))}
                                  placeholder="分值"
                                  min="0"
                                  step="1"
                                  required
                                  style={{
                                    width: '100%',
                                    padding: '0.375rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </div>

                              <div>
                                <label style={{
                                  display: 'block',
                                  fontSize: '0.625rem',
                                  fontWeight: '500',
                                  color: '#6b7280',
                                  marginBottom: '0.25rem'
                                }}>
                                  权重 *
                                </label>
                                <input
                                  type="number"
                                  value={option.weight}
                                  onChange={(e) => updateOptionWeight(group.id, child.id, option.id, parseFloat(e.target.value))}
                                  placeholder="权重"
                                  min="0.1"
                                  max="2"
                                  step="0.1"
                                  required
                                  style={{
                                    width: '100%',
                                    padding: '0.375rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 提交按钮 */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : '#10b981',
                color: 'white',
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1.125rem',
                fontWeight: '600',
                minWidth: '200px'
              }}
            >
              {loading ? '创建中...' : '创建层级问卷'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}