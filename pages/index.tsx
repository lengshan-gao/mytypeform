import React from 'react'

export default function HomePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>调查问卷系统 - 测试页面</h1>
      <p>系统正在运行中...</p>
      <div style={{ marginTop: '2rem' }}>
        <h3>可用功能：</h3>
        <ul>
          <li>✅ API路由正常工作</li>
          <li>✅ 数据库连接正常</li>
          <li>✅ 用户认证系统</li>
          <li>✅ 问卷管理功能</li>
          <li>✅ 图片上传功能</li>
          <li>✅ 防刷机制</li>
          <li>✅ <strong>权重计算问卷</strong> - 支持项目-维度-选项层级结构</li>
          <li>✅ <strong>实时得分计算</strong> - 自动计算项目得分</li>
          <li>✅ <strong>权重验证</strong> - 维度权重总和必须为1</li>
        </ul>
        <p style={{ marginTop: '2rem', color: '#666' }}>
          注意：App Router页面由于Next.js 12兼容性问题暂时不可用。
          API功能可通过以下端点测试：
        </p>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
          GET /api/surveys - 获取问卷列表<br/>
          POST /api/surveys - 创建问卷<br/>
          GET /api/surveys/[id] - 获取问卷详情<br/>
          POST /api/auth/login - 用户登录<br/>
          POST /api/upload/image - 图片上传
        </pre>
        
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a 
            href="/create-survey" 
            style={{
              display: 'inline-block',
              background: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            🚀 创建普通问卷
          </a>
          <a 
            href="/create-weighted-survey" 
            style={{
              display: 'inline-block',
              background: '#f59e0b',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            ⚖️ 创建权重计算问卷
          </a>
          <a 
            href="/surveys" 
            style={{
              display: 'inline-block',
              background: '#8b5cf6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            📋 我的问卷
          </a>
          <a 
            href="/login" 
            style={{
              display: 'inline-block',
              background: '#10b981',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            🔐 用户登录
          </a>
        </div>
      </div>
    </div>
  )
}