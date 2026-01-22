'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FaStar, FaCheckCircle, FaArrowLeft, FaWeixin } from 'react-icons/fa'
import Button from '@/components/Button'
import Card from '@/components/Card'

interface Question {
  id: string
  content: string
  type: 'rating'
  weight: number
  imageUrl?: string
}

interface Survey {
  id: string
  title: string
  description: string
  questions: Question[]
}

export default function SurveyPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string
  
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    fetchSurvey()
  }, [surveyId])

  const fetchSurvey = async () => {
    try {
      setLoading(true)
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 模拟数据
      const mockSurvey: Survey = {
        id: surveyId,
        title: '产品满意度调查',
        description: '感谢您参与本次调查，您的反馈对我们非常重要。',
        questions: [
          {
            id: '1',
            content: '您对产品的整体满意度如何？',
            type: 'rating',
            weight: 1.0,
          },
          {
            id: '2',
            content: '产品功能是否符合您的需求？',
            type: 'rating',
            weight: 1.2,
          },
          {
            id: '3',
            content: '产品的易用性如何？',
            type: 'rating',
            weight: 1.0,
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
          },
          {
            id: '4',
            content: '您会向朋友推荐我们的产品吗？',
            type: 'rating',
            weight: 1.5,
          },
        ],
      }
      
      setSurvey(mockSurvey)
      
      // 初始化答案
      const initialAnswers: Record<string, number> = {}
      mockSurvey.questions.forEach(q => {
        initialAnswers[q.id] = 0
      })
      setAnswers(initialAnswers)
    } catch (err) {
      setError('加载问卷失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }))
    
    // 自动跳到下一题（如果已答完当前题）
    if (currentStep < (survey?.questions.length || 0) - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 300)
    }
  }

  const handleNext = () => {
    if (currentStep < (survey?.questions.length || 0) - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    // 验证是否所有问题都已回答
    const unanswered = survey?.questions.filter(q => !answers[q.id] || answers[q.id] === 0)
    if (unanswered && unanswered.length > 0) {
      setError(`请先回答所有问题，还有 ${unanswered.length} 个问题未回答`)
      return
    }

    setSubmitting(true)
    try {
      // 模拟提交
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 跳转到感谢页面
      router.push(`/survey/${surveyId}/thank-you`)
    } catch (err) {
      setError('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = survey ? ((currentStep + 1) / survey.questions.length) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载问卷...</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">问卷不存在</h3>
            <p className="text-gray-600 mb-6">您访问的问卷可能已被删除或不存在。</p>
            <Button variant="primary" onClick={() => router.push('/')}>
              返回首页
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const currentQuestion = survey.questions[currentStep]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* 微信适配提示 */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center text-sm text-green-800">
            <FaWeixin className="mr-2" />
            <span>微信扫码填写，体验更佳</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6"
        >
          <FaArrowLeft className="mr-2" />
          返回
        </Button>

        {/* 问卷头部 */}
        <Card className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {survey.title}
            </h1>
            <p className="text-gray-600 text-lg">
              {survey.description}
            </p>
          </div>

          {/* 进度条 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                进度：{currentStep + 1} / {survey.questions.length}
              </span>
              <span className="text-sm font-medium text-primary-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 问题导航 */}
          <div className="flex flex-wrap gap-2 mb-8">
            {survey.questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setCurrentStep(index)}
                className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index === currentStep
                    ? 'bg-primary-600 text-white'
                    : answers[question.id]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </Card>

        {/* 当前问题 */}
        <Card>
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                {currentStep + 1}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">问题 {currentStep + 1}</span>
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentQuestion.content}
                </h3>
              </div>
            </div>

            {currentQuestion.imageUrl && (
              <div className="mb-6">
                <img
                  src={currentQuestion.imageUrl}
                  alt="问题图片"
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">请选择评分（1-5分）</span>
                {answers[currentQuestion.id] > 0 && (
                  <span className="text-green-600 font-medium flex items-center">
                    <FaCheckCircle className="mr-1" />
                    已选择：{answers[currentQuestion.id]}分
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleAnswer(currentQuestion.id, score)}
                    className={`
                      h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200
                      ${answers[currentQuestion.id] === score
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center mb-2">
                      {[...Array(score)].map((_, i) => (
                        <FaStar key={i} className="h-5 w-5 text-yellow-500" />
                      ))}
                    </div>
                    <span className="text-2xl font-bold">{score}分</span>
                    <span className="text-xs text-gray-500 mt-1">
                      {score === 1 ? '非常不满意' : 
                       score === 2 ? '不满意' : 
                       score === 3 ? '一般' : 
                       score === 4 ? '满意' : '非常满意'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 导航按钮 */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                上一题
              </Button>

              {currentStep === survey.questions.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  loading={submitting}
                  className="flex items-center"
                >
                  <FaCheckCircle className="mr-2" />
                  提交问卷
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!answers[currentQuestion.id]}
                >
                  下一题
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <div className="text-red-700">{error}</div>
          </Card>
        )}

        {/* 微信提示 */}
        <Card className="mt-6">
          <div className="flex items-start">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <FaWeixin className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">微信扫码填写</h4>
              <p className="text-gray-600 text-sm mt-1">
                将此问卷分享到微信，朋友扫码即可填写。支持微信内直接打开，无需下载APP。
              </p>
              <div className="mt-4 flex items-center space-x-4">
                <div className="h-32 w-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  二维码
                </div>
                <div className="text-sm text-gray-500">
                  <p>• 长按保存二维码</p>
                  <p>• 发送给微信好友</p>
                  <p>• 分享到微信群</p>
                  <p>• 朋友圈分享</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>本问卷为匿名填写，您的个人信息不会被泄露。</p>
          <p className="mt-1">提交后无法修改答案，请仔细核对。</p>
        </div>
      </div>
    </div>
  )
}