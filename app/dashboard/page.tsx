'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  FaPlus, FaChartBar, FaQrcode, FaDownload, 
  FaEye, FaEdit, FaTrash, FaCopy 
} from 'react-icons/fa'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'

interface Survey {
  id: string
  title: string
  description: string
  status: 'draft' | 'published' | 'paused' | 'closed'
  responses: number
  createdAt: string
  expiresAt?: string
}

export default function DashboardPage() {
  const [surveys, setSurveys] = useState<Survey[]>([
    {
      id: '1',
      title: '产品满意度调查',
      description: '收集用户对产品的使用反馈',
      status: 'published',
      responses: 156,
      createdAt: '2023-10-01',
      expiresAt: '2023-12-31',
    },
    {
      id: '2',
      title: '员工培训效果评估',
      description: '评估培训效果和改进建议',
      status: 'draft',
      responses: 0,
      createdAt: '2023-10-15',
    },
    {
      id: '3',
      title: '客户服务满意度',
      description: '收集客户对服务的评价',
      status: 'published',
      responses: 89,
      createdAt: '2023-09-20',
      expiresAt: '2023-11-30',
    },
    {
      id: '4',
      title: '市场调研问卷',
      description: '了解目标用户需求和偏好',
      status: 'closed',
      responses: 342,
      createdAt: '2023-08-10',
      expiresAt: '2023-10-10',
    },
  ])

  const [stats, setStats] = useState({
    totalSurveys: 4,
    totalResponses: 587,
    averageCompletion: 78,
    activeSurveys: 2,
  })

  const [searchQuery, setSearchQuery] = useState('')

  const filteredSurveys = surveys.filter(survey =>
    survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    survey.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: Survey['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Survey['status']) => {
    switch (status) {
      case 'draft': return '草稿'
      case 'published': return '已发布'
      case 'paused': return '已暂停'
      case 'closed': return '已关闭'
      default: return '未知'
    }
  }

  const handleDeleteSurvey = (id: string) => {
    if (window.confirm('确定要删除这个问卷吗？此操作不可撤销。')) {
      setSurveys(surveys.filter(survey => survey.id !== id))
    }
  }

  const handleCopySurvey = (id: string) => {
    const survey = surveys.find(s => s.id === id)
    if (survey) {
      const newSurvey = {
        ...survey,
        id: Date.now().toString(),
        title: `${survey.title} (副本)`,
        status: 'draft' as const,
        responses: 0,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setSurveys([...surveys, newSurvey])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部栏 */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">问卷管理</h1>
              <p className="text-gray-600">创建、管理和分析您的调查问卷</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link href="/surveys/create">
                <Button variant="primary" className="flex items-center space-x-2">
                  <FaPlus />
                  <span>创建新问卷</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总问卷数</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSurveys}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FaChartBar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总回答数</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalResponses}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <FaEye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均完成率</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageCompletion}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <FaChartBar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">进行中问卷</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeSurveys}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <FaQrcode className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 问卷列表 */}
      <div className="container mx-auto px-4 sm:px-6 pb-12">
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">我的问卷</h2>
              <p className="text-gray-600">管理您创建的所有问卷</p>
            </div>
            <div className="mt-4 sm:mt-0 w-full sm:w-64">
              <Input
                placeholder="搜索问卷..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    问卷标题
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    回答数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    截止时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSurveys.map((survey) => (
                  <tr key={survey.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {survey.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {survey.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(survey.status)}`}>
                        {getStatusText(survey.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{survey.responses}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {survey.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {survey.expiresAt || '无'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <Link href={`/surveys/${survey.id}`}>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
                            <FaEye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/surveys/${survey.id}/edit`}>
                          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-900">
                            <FaEdit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:text-purple-900"
                          onClick={() => handleCopySurvey(survey.id)}
                        >
                          <FaCopy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteSurvey(survey.id)}
                        >
                          <FaTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSurveys.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FaChartBar className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无问卷</h3>
                <p className="text-gray-600">创建您的第一个问卷开始收集数据</p>
                <div className="mt-6">
                  <Link href="/surveys/create">
                    <Button variant="primary">创建问卷</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-700">
              显示 <span className="font-medium">{filteredSurveys.length}</span> 个问卷
            </div>
            <div className="mt-4 sm:mt-0">
              <Button variant="outline" className="flex items-center space-x-2">
                <FaDownload />
                <span>导出数据</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* 快速操作 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FaQrcode className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">生成二维码</h3>
                <p className="text-sm text-gray-600 mt-1">为问卷生成专属二维码，方便微信扫码填写</p>
                <Button variant="outline" size="sm" className="mt-4">
                  生成二维码
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <FaChartBar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">查看统计</h3>
                <p className="text-sm text-gray-600 mt-1">实时查看问卷数据统计和可视化分析</p>
                <Button variant="outline" size="sm" className="mt-4">
                  查看统计
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <FaDownload className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">导出报告</h3>
                <p className="text-sm text-gray-600 mt-1">导出问卷数据为Excel或PDF格式报告</p>
                <Button variant="outline" size="sm" className="mt-4">
                  导出报告
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}