'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import { FaWeixin, FaEnvelope, FaLock } from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 这里实际应该调用API
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })
      
      // if (!response.ok) throw new Error('登录失败')
      
      // const data = await response.json()
      // localStorage.setItem('token', data.token)
      
      // 模拟成功
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleWechatLogin = () => {
    // 微信登录逻辑
    window.location.href = '/api/auth/wechat'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center">
              <span className="text-white text-xl font-bold">Q</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            欢迎回来
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            还没有账户？{' '}
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              免费注册
            </Link>
          </p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                label="邮箱地址"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="请输入邮箱"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<FaEnvelope className="text-gray-400" />}
              />
            </div>

            <div>
              <Input
                label="密码"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="请输入密码"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<FaLock className="text-gray-400" />}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  记住我
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  忘记密码？
                </Link>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                登录
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或使用以下方式登录</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
                onClick={handleWechatLogin}
              >
                <FaWeixin className="text-green-500" />
                <span>微信登录</span>
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  登录即表示您同意我们的{' '}
                  <Link href="/terms" className="underline">服务条款</Link>
                  {' '}和{' '}
                  <Link href="/privacy" className="underline">隐私政策</Link>
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            返回{' '}
            <Link href="/" className="font-medium text-primary-600 hover:text-primary-500">
              首页
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}