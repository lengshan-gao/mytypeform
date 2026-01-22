import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 未授权，跳转到登录页
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            window.location.href = '/login'
          }
          break
        case 403:
          // 权限不足
          console.error('权限不足:', data.message)
          break
        case 404:
          // 资源不存在
          console.error('资源不存在:', data.message)
          break
        case 422:
          // 验证错误
          console.error('验证错误:', data.errors)
          break
        case 500:
          // 服务器错误
          console.error('服务器错误:', data.message)
          break
        default:
          console.error('请求错误:', error.message)
      }
    } else if (error.request) {
      // 请求发送成功，但没有收到响应
      console.error('网络错误，请检查网络连接')
    } else {
      // 请求配置错误
      console.error('请求配置错误:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

// API错误类型
export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

// 通用API调用函数
export async function fetchApi<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any
): Promise<T> {
  try {
    const response = await api.request({
      method,
      url,
      data: method !== 'GET' ? data : undefined,
      params: method === 'GET' ? data : undefined,
    })
    
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new ApiError(
        error.response.data.message || '请求失败',
        error.response.status,
        error.response.data.errors
      )
    }
    throw error
  }
}

// 简化的API方法
export const get = <T>(url: string, params?: any) => fetchApi<T>('GET', url, params)
export const post = <T>(url: string, data?: any) => fetchApi<T>('POST', url, data)
export const put = <T>(url: string, data?: any) => fetchApi<T>('PUT', url, data)
export const del = <T>(url: string, data?: any) => fetchApi<T>('DELETE', url, data)