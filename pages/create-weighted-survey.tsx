import React, { useState } from 'react'
import { useRouter } from 'next/router'

interface Dimension {
  id: string
  content: string
  weight: number
  options: Array<{ id: string; content: string; score: number }>
}

interface Project {
  id: string
  content: string
  imageUrl?: string
  dimensions: Dimension[]
}

export default function CreateWeightedSurveyPage() {
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadingImage, setUploadingImage] = useState<string | null>(null)
  
  const [surveyData, setSurveyData] = useState({
    title: '',
    description: '',
    expiresAt: '',
  })
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'project_1',
      content: '项目一',
      dimensions: [
        {
          id: 'dimension_1_1',
          content: '维度A',
          weight: 0.1,
          options: [
            { id: 'option_1_1_1', content: '1分', score: 1 },
            { id: 'option_1_1_2', content: '3分', score: 3 },
            { id: 'option_1_1_3', content: '9分', score: 9 },
          ]
        },
        {
          id: 'dimension_1_2',
          content: '维度B',
          weight: 0.3,
          options: [
            { id: 'option_1_2_1', content: '1分', score: 1 },
            { id: 'option_1_2_2', content: '3分', score: 3 },
            { id: 'option_1_2_3', content: '9分', score: 9 },
          ]
        },
        {
          id: 'dimension_1_3',
          content: '维度C',
          weight: 0.2,
          options: [
            { id: 'option_1_3_1', content: '1分', score: 1 },
            { id: 'option_1_3_2', content: '3分', score: 3 },
            { id: 'option_1_3_3', content: '9分', score: 9 },
          ]
        },
        {
          id: 'dimension_1_4',
          content: '维度D',
          weight: 0.2,
          options: [
            { id: 'option_1_4_1', content: '1分', score: 1 },
            { id: 'option_1_4_2', content: '3分', score: 3 },
            { id: 'option_1_4_3', content: '9分', score: 9 },
          ]
        },
        {
          id: 'dimension_1_5',
          content: '维度E',
          weight: 0.2,
          options: [
            { id: 'option_1_5_1', content: '1分', score: 1 },
            { id: 'option_1_5_2', content: '3分', score: 3 },
            { id: 'option_1_5_3', content: '9分', score: 9 },
          ]
        }
      ]
    }
  ])

  const handleSurveyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSurveyData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const updateProjectContent = (projectId: string, content: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId ? { ...project, content } : project
    ))
  }

  const updateDimensionContent = (projectId: string, dimensionId: string, content: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId ? {
        ...project,
        dimensions: project.dimensions.map(dimension => 
          dimension.id === dimensionId ? { ...dimension, content } : dimension
        )
      } : project
    ))
  }

  const updateDimensionWeight = (projectId: string, dimensionId: string, weight: number) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId ? {
        ...project,
        dimensions: project.dimensions.map(dimension => 
          dimension.id === dimensionId ? { ...dimension, weight } : dimension
        )
      } : project
    ))
  }

  // 图片上传处理函数
  const handleImageUpload = async (projectId: string, file: File) => {
    try {
      setUploadingImage(projectId)
      
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (result.success) {
        // 更新项目的图片URL
        setProjects(prev => prev.map(project => 
          project.id === projectId 
            ? { ...project, imageUrl: result.data.imageUrl }
            : project
        ))
      } else {
        setError(result.message || '图片上传失败')
      }
    } catch (err) {
      setError('图片上传失败，请稍后重试')
    } finally {
      setUploadingImage(null)
    }
  }

  // 删除项目图片
  const removeProjectImage = (projectId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, imageUrl: undefined }
        : project
    ))
  }

  const addProject = () => {
    const newProjectId = `project_${Date.now()}`
    setProjects(prev => [...prev, {
      id: newProjectId,
      content: `项目${prev.length + 1}`,
      dimensions: [
        {
          id: `dimension_${newProjectId}_1`,
          content: '维度A',
          weight: 0.1,
          options: [
            { id: `option_${newProjectId}_1_1`, content: '1分', score: 1 },
            { id: `option_${newProjectId}_1_2`, content: '3分', score: 3 },
            { id: `option_${newProjectId}_1_3`, content: '9分', score: 9 },
          ]
        }
      ]
    }])
  }

  const addDimension = (projectId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId ? {
        ...project,
        dimensions: [...project.dimensions, {
          id: `dimension_${projectId}_${project.dimensions.length + 1}`,
          content: `维度${String.fromCharCode(65 + project.dimensions.length)}`,
          weight: 0.1,
          options: [
            { id: `option_${projectId}_${project.dimensions.length + 1}_1`, content: '1分', score: 1 },
            { id: `option_${projectId}_${project.dimensions.length + 1}_2`, content: '3分', score: 3 },
            { id: `option_${projectId}_${project.dimensions.length + 1}_3`, content: '9分', score: 9 },
          ]
        }]
      } : project
    ))
  }

  const removeProject = (projectId: string) => {
    if (projects.length <= 1) {
      alert('至少需要保留一个项目')
      return
    }
    setProjects(prev => prev.filter(project => project.id !== projectId))
  }

  const removeDimension = (projectId: string, dimensionId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId ? {
        ...project,
        dimensions: project.dimensions.filter(dimension => dimension.id !== dimensionId)
      } : project
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      // 验证数据
      if (!surveyData.title.trim()) {
        setError('请输入问卷标题')
        return
      }

      // 验证权重总和
      for (const project of projects) {
        const totalWeight = project.dimensions.reduce((sum, dim) => sum + dim.weight, 0)
        if (Math.abs(totalWeight - 1) > 0.001) {
          setError(`项目"${project.content}"的维度权重总和必须为1，当前为${totalWeight}`)
          return
        }
      }

      const token = localStorage.getItem('token')
      if (!token) {
        setError('请先登录')
        router.push('/login?returnTo=/create-weighted-survey')
        return
      }

      // 处理过期时间：如果为空字符串，设置为null
      const processedSurveyData = {
        ...surveyData,
        expiresAt: surveyData.expiresAt.trim() ? surveyData.expiresAt : null,
      }

      const response = await fetch('/api/surveys/create-weighted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...processedSurveyData,
          projects
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSuccess('权重计算问卷创建成功！')
        setTimeout(() => {
          router.push('/surveys')
        }, 2000)
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
      fontFamily: 'sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '2rem 1rem'
      }}>
        {/* 页面标题 */}
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
            创建权重计算问卷
          </h1>
          <button
            onClick={() => router.back()}
            style={{
              padding: '0.5rem 1rem',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            返回
          </button>
        </div>

        {/* 成功提示 */}
        {success && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#16a34a',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            {success}
          </div>
        )}

        {/* 错误提示 */}
        {error && (
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

        <form onSubmit={handleSubmit}>
          {/* 问卷基本信息 */}
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
              问卷基本信息
            </h2>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
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
                  onChange={handleSurveyChange}
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

              <div>
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
                  onChange={handleSurveyChange}
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
                  过期时间（可选）
                </label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={surveyData.expiresAt}
                  onChange={handleSurveyChange}
                  placeholder="留空表示永不过期"
                  min={new Date().toISOString().slice(0, 16)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                />
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.25rem'
                }}>
                  留空表示问卷永不过期，设置过期时间请选择未来日期
                </div>
              </div>
            </div>
          </div>

          {/* 项目配置 */}
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: '#1f2937'
              }}>
                项目配置 ({projects.length})
              </h2>
              
              <button
                type="button"
                onClick={addProject}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                添加项目
              </button>
            </div>

            {projects.map((project, projectIndex) => (
              <div key={project.id} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                background: '#f9fafb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    color: '#1f2937'
                  }}>
                    项目 {projectIndex + 1}
                  </h3>
                  
                  <button
                    type="button"
                    onClick={() => removeProject(project.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    删除项目
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
                    项目名称
                  </label>
                  <input
                    type="text"
                    value={project.content}
                    onChange={(e) => updateProjectContent(project.id, e.target.value)}
                    placeholder="请输入项目名称"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                {/* 项目图片上传 */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    项目图片（可选）
                  </label>
                  
                  {project.imageUrl ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <img 
                        src={project.imageUrl} 
                        alt="项目预览"
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '0.5rem',
                          border: '1px solid #e5e7eb'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeProjectImage(project.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        删除图片
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      border: '2px dashed #d1d5db',
                      borderRadius: '0.5rem',
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db'
                    }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleImageUpload(project.id, file)
                          }
                        }}
                        style={{
                          display: 'none'
                        }}
                        id={`image-upload-${project.id}`}
                      />
                      <label 
                        htmlFor={`image-upload-${project.id}`}
                        style={{
                          display: 'block',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          {uploadingImage === project.id ? '上传中...' : '点击上传项目图片'}
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          支持 JPG、PNG 格式，最大 5MB
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    color: '#374151'
                  }}>
                    维度配置 ({project.dimensions.length})
                  </h4>
                  
                  <button
                    type="button"
                    onClick={() => addDimension(project.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    添加维度
                  </button>
                </div>

                {project.dimensions.map((dimension, dimensionIndex) => (
                  <div key={dimension.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    padding: '1rem',
                    marginBottom: '1rem',
                    background: 'white'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem'
                    }}>
                      <h5 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        color: '#374151'
                      }}>
                        维度 {dimensionIndex + 1}
                      </h5>
                      
                      <button
                        type="button"
                        onClick={() => removeDimension(project.id, dimension.id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        删除维度
                      </button>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 150px', 
                      gap: '1rem',
                      alignItems: 'end'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#6b7280',
                          marginBottom: '0.25rem'
                        }}>
                          维度名称
                        </label>
                        <input
                          type="text"
                          value={dimension.content}
                          onChange={(e) => updateDimensionContent(project.id, dimension.id, e.target.value)}
                          placeholder="请输入维度名称"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#6b7280',
                          marginBottom: '0.25rem'
                        }}>
                          权重 (0-1)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          value={dimension.weight}
                          onChange={(e) => updateDimensionWeight(project.id, dimension.id, parseFloat(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '0.75rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '0.5rem'
                      }}>
                        选项配置 (固定3个选项：1分、3分、9分)
                      </label>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '0.5rem'
                      }}>
                        {dimension.options.map((option, optionIndex) => (
                          <div key={option.id} style={{
                            padding: '0.5rem',
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.25rem',
                            textAlign: 'center'
                          }}>
                            <div style={{
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: '#374151'
                            }}>
                              {option.content}
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#6b7280'
                            }}>
                              分值: {option.score}分
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* 权重总和显示 */}
                <div style={{
                  padding: '0.75rem',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '0.375rem',
                  marginTop: '1rem'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#0369a1'
                  }}>
                    当前维度权重总和: {project.dimensions.reduce((sum, dim) => sum + dim.weight, 0).toFixed(2)}
                    {Math.abs(project.dimensions.reduce((sum, dim) => sum + dim.weight, 0) - 1) > 0.001 && (
                      <span style={{ color: '#dc2626', marginLeft: '0.5rem' }}>
                        (权重总和必须为1)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
              {loading ? '创建中...' : '创建权重计算问卷'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}