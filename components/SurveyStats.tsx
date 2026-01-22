'use client'

import { useState, useEffect } from 'react'
import { FaUsers, FaCheckCircle, FaChartBar, FaClock } from 'react-icons/fa'
import StatsChart from './StatsChart'
import Card from './Card'
import Button from './Button'

interface SurveyStatsProps {
  surveyId: string
  className?: string
}

interface StatsData {
  totalResponses: number
  completionRate: number
  averageScore: number
  dailyResponses: { date: string; count: number }[]
  scoreDistribution: { score: number; count: number }[]
  questionStats: {
    question: string
    averageScore: number
    weight: number
  }[]
}

export default function SurveyStats({ surveyId, className = '' }: SurveyStatsProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('7days')

  useEffect(() => {
    fetchStats()
  }, [surveyId, timeRange])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 模拟数据
      const mockStats: StatsData = {
        totalResponses: 156,
        completionRate: 78,
        averageScore: 4.2,
        dailyResponses: [
          { date: '10-01', count: 12 },
          { date: '10-02', count: 18 },
          { date: '10-03', count: 24 },
          { date: '10-04', count: 15 },
          { date: '10-05', count: 22 },
          { date: '10-06', count: 19 },
          { date: '10-07', count: 16 },
        ],
        scoreDistribution: [
          { score: 1, count: 5 },
          { score: 2, count: 12 },
          { score: 3, count: 28 },
          { score: 4, count: 56 },
          { score: 5, count: 55 },
        ],
        questionStats: [
          { question: '整体满意度', averageScore: 4.5, weight: 1.0 },
          { question: '功能符合需求', averageScore: 4.2, weight: 1.2 },
          { question: '易用性', averageScore: 4.0, weight: 1.0 },
          { question: '推荐意愿', averageScore: 4.1, weight: 1.5 },
        ],
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error('获取统计失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600 bg-green-100'
    if (score >= 4.0) return 'text-blue-600 bg-blue-100'
    if (score >= 3.0) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (loading && !stats) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载统计中...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <Card className={className}>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无数据</h3>
          <p className="text-gray-600">该问卷还没有收集到任何数据</p>
        </div>
      </Card>
    )
  }

  // 准备图表数据
  const dailyChartData = {
    labels: stats.dailyResponses.map(d => d.date),
    datasets: [
      {
        label: '每日填写量',
        data: stats.dailyResponses.map(d => d.count),
        backgroundColor: ['rgba(59, 130, 246, 0.5)'],
        borderColor: ['rgb(59, 130, 246)'],
        borderWidth: 2,
      },
    ],
  }

  const scoreChartData = {
    labels: stats.scoreDistribution.map(s => `${s.score}分`),
    datasets: [
      {
        label: '分数分布',
        data: stats.scoreDistribution.map(s => s.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(22, 163, 74, 0.7)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)',
          'rgb(234, 179, 8)',
          'rgb(34, 197, 94)',
          'rgb(22, 163, 74)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const questionChartData = {
    labels: stats.questionStats.map(q => q.question),
    datasets: [
      {
        label: '平均分数',
        data: stats.questionStats.map(q => q.averageScore),
        backgroundColor: ['rgba(139, 92, 246, 0.5)'],
        borderColor: ['rgb(139, 92, 246)'],
        borderWidth: 2,
      },
      {
        label: '权重',
        data: stats.questionStats.map(q => q.weight),
        backgroundColor: ['rgba(236, 72, 153, 0.5)'],
        borderColor: ['rgb(236, 72, 153)'],
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 时间范围选择 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">问卷统计</h3>
        <div className="flex space-x-2">
          {(['7days', '30days', 'all'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7days' ? '7天' : range === '30days' ? '30天' : '全部'}
            </Button>
          ))}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总填写数</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalResponses}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FaUsers className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">较上周增长 12%</p>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">完成率</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <FaCheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">平均完成时间：2.5分钟</p>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均分数</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <FaChartBar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">满分5分，权重计算后</p>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均耗时</p>
              <p className="text-3xl font-bold text-gray-900">2.5</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <FaClock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">分钟/问卷</p>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="填写趋势" subtitle="每日填写数量变化">
          <StatsChart
            type="bar"
            data={dailyChartData}
            height={250}
          />
        </Card>

        <Card title="分数分布" subtitle="各分数段填写数量">
          <StatsChart
            type="doughnut"
            data={scoreChartData}
            height={250}
          />
        </Card>
      </div>

      {/* 问题分析 */}
      <Card title="问题分析" subtitle="各问题的平均分数和权重">
        <div className="space-y-4">
          {stats.questionStats.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="h-6 w-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                    {index + 1}
                  </div>
                  <h4 className="font-medium text-gray-900">{item.question}</h4>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>权重：{item.weight}</span>
                  <span>影响系数：{(item.averageScore * item.weight).toFixed(2)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(item.averageScore)}`}>
                  {item.averageScore.toFixed(1)} 分
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  共 {Math.round(stats.totalResponses * 0.8)} 人回答
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 详细统计 */}
      <Card title="详细统计" subtitle="更多数据分析">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">问题分数对比</h4>
            <StatsChart
              type="bar"
              data={questionChartData}
              height={200}
            />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">关键指标</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">满意度指数</span>
                  <span className="font-medium">{(stats.averageScore * 20).toFixed(0)}/100</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${stats.averageScore * 20}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">推荐指数</span>
                  <span className="font-medium">
                    {Math.round(stats.scoreDistribution[4].count / stats.totalResponses * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${stats.scoreDistribution[4].count / stats.totalResponses * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">负面反馈率</span>
                  <span className="font-medium">
                    {Math.round((stats.scoreDistribution[0].count + stats.scoreDistribution[1].count) / stats.totalResponses * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ width: `${(stats.scoreDistribution[0].count + stats.scoreDistribution[1].count) / stats.totalResponses * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 导出功能 */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="font-medium text-gray-900">导出数据</h4>
            <p className="text-gray-600 text-sm">导出完整的统计数据和原始回答</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button variant="outline">导出Excel</Button>
            <Button variant="outline">导出PDF报告</Button>
            <Button variant="primary">分享统计</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}