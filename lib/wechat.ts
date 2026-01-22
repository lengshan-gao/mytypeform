/**
 * 微信浏览器适配工具
 */

// 检测是否在微信浏览器中
export function isWechatBrowser(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  const ua = window.navigator.userAgent.toLowerCase()
  return ua.includes('micromessenger')
}

// 检测是否在微信小程序中
export function isWechatMiniProgram(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  // 微信小程序有特定的window对象属性
  return (window as any).__wxjs_environment === 'miniprogram'
}

// 获取微信版本号
export function getWechatVersion(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  const ua = window.navigator.userAgent.toLowerCase()
  const match = ua.match(/micromessenger\/([\d.]+)/i)
  return match ? match[1] : null
}

// 检查是否支持微信JS-SDK
export function isWechatJSReady(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  return !!(window as any).wx && typeof (window as any).wx.ready === 'function'
}

// 微信分享配置接口
export interface WechatShareConfig {
  title: string
  desc: string
  link: string
  imgUrl: string
}

// 初始化微信分享（需要后端签名）
export async function initWechatShare(config: WechatShareConfig): Promise<boolean> {
  if (!isWechatBrowser()) {
    return false
  }
  
  try {
    // 这里需要从后端获取微信JS-SDK签名
    // const response = await fetch('/api/wechat/signature', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ url: window.location.href }),
    // })
    // const { appId, timestamp, nonceStr, signature } = await response.json()
    
    // 初始化微信JS-SDK
    // (window as any).wx.config({
    //   debug: false,
    //   appId,
    //   timestamp,
    //   nonceStr,
    //   signature,
    //   jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'],
    // })
    
    // (window as any).wx.ready(() => {
    //   // 分享给朋友
    //   (window as any).wx.updateAppMessageShareData({
    //     title: config.title,
    //     desc: config.desc,
    //     link: config.link,
    //     imgUrl: config.imgUrl,
    //   })
      
    //   // 分享到朋友圈
    //   (window as any).wx.updateTimelineShareData({
    //     title: config.title,
    //     link: config.link,
    //     imgUrl: config.imgUrl,
    //   })
    // })
    
    return true
  } catch (error) {
    console.error('微信分享初始化失败:', error)
    return false
  }
}

// 生成微信分享二维码URL
export function generateWechatQRCodeUrl(url: string, size: number = 430): string {
  // 微信官方二维码生成API（需要企业认证）
  // return `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(ticket)}`
  
  // 使用第三方服务或本地生成
  return url
}

// 微信浏览器样式修复
export function applyWechatStyleFixes(): void {
  if (typeof window === 'undefined' || !isWechatBrowser()) {
    return
  }
  
  // 修复iOS微信下拉黑边
  document.documentElement.style.height = '100%'
  document.body.style.height = '100%'
  
  // 修复输入框被键盘顶起
  const isIOS = /iphone|ipod|ipad/i.test(navigator.userAgent)
  if (isIOS) {
    document.body.addEventListener('focusin', () => {
      setTimeout(() => {
        document.body.scrollTop = document.body.scrollHeight
      }, 100)
    })
  }
}

// 获取微信登录URL
export function getWechatLoginUrl(redirectUri: string, state?: string): string {
  const appId = process.env.NEXT_PUBLIC_WECHAT_APP_ID || 'your-app-id'
  const encodedRedirectUri = encodeURIComponent(redirectUri)
  const scope = 'snsapi_userinfo' // 需要用户信息时使用snsapi_userinfo，否则snsapi_base
  
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=${scope}&state=${state || ''}#wechat_redirect`
}

// 处理微信返回的code
export async function handleWechatCode(code: string): Promise<{
  openid?: string
  unionid?: string
  nickname?: string
  avatar?: string
}> {
  try {
    // 这里应该调用后端API，用code换取access_token和用户信息
    // const response = await fetch('/api/auth/wechat/callback', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ code }),
    // })
    
    // return await response.json()
    
    // 模拟返回
    return {
      openid: `wx_openid_${Date.now()}`,
      nickname: '微信用户',
      avatar: 'https://thirdwx.qlogo.cn/placeholder',
    }
  } catch (error) {
    console.error('微信登录处理失败:', error)
    throw error
  }
}

// 微信支付相关（需要企业认证）
export interface WechatPayConfig {
  timestamp: string
  nonceStr: string
  package: string
  signType: 'MD5' | 'HMAC-SHA256'
  paySign: string
}

// 初始化微信支付
export function initWechatPayment(config: WechatPayConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isWechatBrowser()) {
      reject(new Error('非微信浏览器'))
      return
    }
    
    if (!isWechatJSReady()) {
      reject(new Error('微信JS-SDK未加载'))
      return
    }
    
    // (window as any).wx.chooseWXPay({
    //   timestamp: config.timestamp,
    //   nonceStr: config.nonceStr,
    //   package: config.package,
    //   signType: config.signType,
    //   paySign: config.paySign,
    //   success: resolve,
    //   fail: reject,
    // })
    
    // 模拟成功
    setTimeout(resolve, 1000)
  })
}