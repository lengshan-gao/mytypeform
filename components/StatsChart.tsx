'use client'

import { useEffect, useRef } from 'react'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor: string[]
    borderWidth: number
  }[]
}

interface StatsChartProps {
  type: 'bar' | 'pie' | 'line' | 'doughnut'
  data: ChartData
  title?: string
  height?: number
  className?: string
}

export default function StatsChart({ type, data, title, height = 300, className = '' }: StatsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<any>(null)

  useEffect(() => {
    let mounted = true

    const initChart = async () => {
      if (!chartRef.current || !mounted) return

      // 动态导入Chart.js
      const ChartJS = await import('chart.js/auto')
      const Chart = ChartJS.default

      // 销毁之前的图表实例
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }

      // 创建新图表
      const ctx = chartRef.current.getContext('2d')
      if (!ctx) return

      chartInstanceRef.current = new Chart(ctx, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true,
                font: {
                  size: 12,
                },
              },
            },
            title: {
              display: !!title,
              text: title,
              font: {
                size: 16,
                weight: 'bold',
              },
              padding: {
                top: 10,
                bottom: 30,
              },
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleFont: {
                size: 12,
              },
              bodyFont: {
                size: 12,
              },
              padding: 10,
              cornerRadius: 6,
            },
          },
          scales: type === 'bar' || type === 'line' ? {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },

            },
            x: {
              grid: {
                display: false,
              },
            },
          } : undefined,
        },
      })
    }

    initChart()

    return () => {
      mounted = false
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [type, data, title])

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <canvas ref={chartRef} />
      
      {/* 加载状态 */}
      {!chartInstanceRef.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">加载图表中...</p>
          </div>
        </div>
      )}
    </div>
  )
}