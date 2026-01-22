'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import { FaUser, FaEnvelope, FaLock, FaCheck } from 'react-icons/fa'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('请输入用户名')
      return false
    }
    if (!formData.email.trim()) {
      setError('请输入邮箱地址')
      return false
    }
    if (!formData.password) {
      setError('请输入密码')
      return false
    }
    if (formData.password.length < 6) {
      setError('密码长度至少6位')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return false
    }
    if (!agreed) {
      setError('请同意服务条款和隐私政策')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // 这里实际应该调用API
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     email: formData.email,
      //     password: formData.password,
      //   }),
      // })
      
      // if (!response.ok) throw new Error('注册失败')
      
      // const data = await response.json()
      // localStorage.setItem('token', data.token)
      
      // 模拟成功
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试')
    } finally {
      setLoading(false)
    }
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
            创建新账户
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            已有账户？{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              立即登录
            </Link>
          </p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                label="用户名"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="请输入用户名"
                value={formData.name}
                onChange={handleChange}
                leftIcon={<FaUser className="text-gray-400" />}
              />
            </div>

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
                autoComplete="new-password"
                required
                placeholder="请输入密码（至少6位）"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<FaLock className="text-gray-400" />}
              />
            </div>

            <div>
              <Input
                label="确认密码"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="请再次输入密码"
                value={formData.confirmPassword}
                onChange={handleChange}
                leftIcon={<FaCheck className="text-gray-400" />}
              />
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  我同意{' '}
                  <Link href="/terms" className="font-medium text-primary-600 hover:text-primary-500">
                    服务条款
                  </Link>
                  {' '}和{' '}
                  <Link href="/privacy" className="font-medium text-primary-600 hover:text-primary-500">
                    隐私政策
                  </Link>
                </label>
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
                注册
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">注册即表示您同意我们的条款</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                注册后，您将可以使用所有功能，包括创建问卷、收集数据、生成报告等。
              </p>
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