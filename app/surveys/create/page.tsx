'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FaPlus, FaTrash, FaImage, FaArrowUp, FaArrowDown, 
  FaSave, FaEye, FaQrcode, FaCopy 
} from 'react-icons/fa'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import { post } from '@/lib/api'

interface Question {
  id: string
  content: string
  type: 'rating'
  imageUrl?: string
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
    },
    {
      id: '2',
      content: '产品功能是否符合您的需求？',
      type: 'rating',
    },
  ])

  const handleSurveyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSurvey(prev => ({ ...prev, [name]: value }))
  }

  const handleQuestionChange = (id: string, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const addQuestion = () => {
    const newId = Date.now().toString()
    setQuestions([...questions, {
      id: newId,
      content: '',
      type: 'rating',
    }])
  }

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) {
      alert('至少需要一个问题')
      return
    }
    setQuestions(questions.filter(q => q.id !== id))
  }

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions]
    if (direction === 'up' && index > 0) {
      [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]]
    } else if (direction === 'down' && index < newQuestions.length - 1) {
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]]
    }
    setQuestions(newQuestions)
  }

  const handleImageUpload = async (questionId: string, file: File) => {
    // 文件验证
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    // 检查文件类型
    if (!allowedTypes.includes(file.type)) {
      alert(`不支持的文件类型：${file.type}\n请上传 JPG、PNG、GIF 或 WebP 格式的图片。`)
      return
    }
    
    // 检查文件大小
    if (file.size > maxSize) {
      alert(`文件大小超过限制：${(file.size / 1024 / 1024).toFixed(2)}MB\n最大支持 5MB 的图片。`)
      return
    }
    
    // 调用图片上传API
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      // 获取认证令牌
      const token = localStorage.getItem('token')
      if (!token) {
        alert('请先登录')
        router.push('/login')
        return
      }
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '图片上传失败')
      }
      
      const data = await response.json()
      if (data.success) {
        handleQuestionChange(questionId, 'imageUrl', data.data.url)
        alert('图片上传成功')
      } else {
        throw new Error(data.message || '图片上传失败')
      }
    } catch (err: any) {
      alert(err.message || '图片上传失败')
    }
  }

  const validateForm = () => {
    if (!survey.title.trim()) {
      setError('请输入问卷标题')
      return false
    }
    if (questions.some(q => !q.content.trim())) {
      setError('请填写所有问题内容')
      return false
    }
    return true
  }

  const handleSaveDraft = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    try {
      // 创建问卷草稿
      const surveyData = {
        title: survey.title.trim(),
        description: survey.description.trim() || null,
        expiresAt: survey.expiresAt || null,
        status: 'DRAFT',
        questions: questions.map((q, index) => ({
          content: q.content.trim(),
          type: 'RATING',
          imageUrl: q.imageUrl || null,
          order: index + 1,
        })),
      }
      
      const response = await post('/api/surveys', surveyData)
      
      if (response.success) {
        alert('问卷已保存为草稿')
        router.push('/dashboard')
      } else {
        throw new Error(response.message || '保存失败')
      }
    } catch (err: any) {
      setError(err.message || '保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!validateForm()) return
    
    if (!window.confirm('发布后问卷将对所有人开放，确定要发布吗？')) {
      return
    }
    
    setLoading(true)
    try {
      // 创建并发布问卷
      const surveyData = {
        title: survey.title.trim(),
        description: survey.description.trim() || null,
        expiresAt: survey.expiresAt || null,
        status: 'PUBLISHED',
        questions: questions.map((q, index) => ({
          content: q.content.trim(),
          type: 'RATING',
          imageUrl: q.imageUrl || null,
          order: index + 1,
        })),
      }
      
      const response = await post('/api/surveys', surveyData)
      
      if (response.success) {
        alert('问卷发布成功！')
        router.push('/dashboard')
      } else {
        throw new Error(response.message || '发布失败')
      }
    } catch (err: any) {
      setError(err.message || '发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部操作栏 */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">创建问卷</h1>
              <p className="text-gray-600">设计您的调查问卷，添加问题和图片</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                loading={loading}
                disabled={loading}
              >
                <FaSave className="mr-2" />
                保存草稿
              </Button>
              <Button
                variant="primary"
                onClick={handlePublish}
                loading={loading}
                disabled={loading}
              >
                <FaEye className="mr-2" />
                发布问卷
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：问卷设置 */}
          <div className="lg:col-span-1">
            <Card title="问卷设置" subtitle="配置问卷的基本信息">
              <div className="space-y-6">
                <div>
                  <Input
                    label="问卷标题"
                    name="title"
                    value={survey.title}
                    onChange={handleSurveyChange}
                    placeholder="请输入问卷标题"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    问卷描述
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={survey.description}
                    onChange={handleSurveyChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="请输入问卷描述（可选）"
                  />
                </div>

                <div>
                  <Input
                    label="截止时间"
                    name="expiresAt"
                    type="datetime-local"
                    value={survey.expiresAt}
                    onChange={handleSurveyChange}
                    helperText="留空表示不设置截止时间"
                  />
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">问卷状态</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                      <span className="text-gray-700">草稿</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      保存为草稿后，您可以继续编辑问卷。只有发布后，用户才能填写问卷。
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* 操作提示 */}
            <Card className="mt-6" title="操作提示">
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-xs">1</span>
                  </div>
                  <span>填写问卷标题和描述</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-xs">2</span>
                  </div>
                  <span>添加和编辑问题，设置分数权重</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-xs">3</span>
                  </div>
                  <span>为问题添加图片（可选）</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-xs">4</span>
                  </div>
                  <span>保存草稿或直接发布问卷</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* 右侧：问题管理 */}
          <div className="lg:col-span-2">
            <Card
              title="问题管理"
              subtitle="添加、编辑和排序问题"
              footer={
                <Button
                  variant="outline"
                  onClick={addQuestion}
                  className="w-full flex items-center justify-center"
                >
                  <FaPlus className="mr-2" />
                  添加问题
                </Button>
              }
            >
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <Card key={question.id} className="relative">
                    {/* 问题操作栏 */}
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveQuestion(index, 'up')}
                        disabled={index === 0}
                      >
                        <FaArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveQuestion(index, 'down')}
                        disabled={index === questions.length - 1}
                      >
                        <FaArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <FaTrash className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* 问题编号 */}
                    <div className="flex items-center mb-4">
                      <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700">问题 {index + 1}</span>
                    </div>

                    {/* 问题内容 */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          问题内容
                        </label>
                        <textarea
                          value={question.content}
                          onChange={(e) => handleQuestionChange(question.id, 'content', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={3}
                          placeholder="请输入问题内容"
                        />
                      </div>

                      {/* 问题类型和权重 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            问题类型
                          </label>
                          <select
                            value={question.type}
                            onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            disabled
                          >
                            <option value="rating">打分题（1-5分）</option>
                            {/* 后续可扩展其他类型 */}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            分数权重（{question.weight}）
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={question.weight}
                            onChange={(e) => handleQuestionChange(question.id, 'weight', parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0.1</span>
                            <span>权重值</span>
                            <span>5.0</span>
                          </div>
                        </div>
                      </div>

                      {/* 图片上传 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          问题图片（可选）
                        </label>
                        <div className="mt-1 flex items-center space-x-4">
                          <div className="flex-1">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/jpg,image/png,image/gif,image/webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(question.id, file)
                              }}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                            />
                          </div>
                          {question.imageUrl && (
                            <div className="relative">
                              <img
                                src={question.imageUrl}
                                alt="问题图片"
                                className="h-20 w-20 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => handleQuestionChange(question.id, 'imageUrl', '')}
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          支持 JPG、JPEG、PNG、GIF、WebP 格式，最大 5MB
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* 预览区域 */}
            <Card className="mt-6" title="问卷预览" subtitle="实时预览问卷效果">
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {survey.title || '问卷标题'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {survey.description || '问卷描述'}
                  </p>

                  {questions.map((question, index) => (
                    <div key={question.id} className="mb-8 last:mb-0">
                      <div className="flex items-start mb-4">
                        <div className="h-6 w-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center mr-3 mt-1">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {question.content || '问题内容'}
                          </h4>
                          {question.imageUrl && (
                            <div className="mt-3">
                              <img
                                src={question.imageUrl}
                                alt="问题图片"
                                className="max-w-full h-auto rounded-lg"
                              />
                            </div>
                          )}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">请打分（1-5分）</span>
                              <span className="text-sm text-gray-500">权重：{question.weight}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {[1, 2, 3, 4, 5].map((score) => (
                                <label key={score} className="flex-1">
                                  <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={score}
                                    className="sr-only"
                                  />
                                  <div className="h-12 rounded-lg border border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                                    <span className="text-lg font-medium">{score}分</span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    共 {questions.length} 个问题
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" className="flex items-center">
                      <FaQrcode className="mr-2" />
                      生成二维码
                    </Button>
                    <Button variant="outline" className="flex items-center">
                      <FaCopy className="mr-2" />
                      复制问卷
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}