import { Context, Next } from 'koa'

/**
 * Rate Limit 中间件
 * 防止暴力破解和滥用
 */
const requests = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(options: {
  windowMs?: number
  max?: number
  message?: string
} = {}) {
  const {
    windowMs = 60 * 1000, // 1 分钟
    max = 100, // 每分钟最多 100 次请求
    message = '请求过于频繁，请稍后再试',
  } = options

  return async (ctx: Context, next: Next) => {
    const ip = ctx.ip
    const now = Date.now()

    const record = requests.get(ip)

    if (!record || now > record.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs })
    } else if (record.count >= max) {
      ctx.status = 429
      ctx.body = { success: false, message, error: message }
      return
    } else {
      record.count++
    }

    await next()
  }
}

// 更严格的登录限流
const loginAttempts = new Map<string, { count: number; lockUntil: number }>()

export function loginRateLimit(options: {
  windowMs?: number
  max?: number
  lockTime?: number
} = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 分钟
    max = 5, // 最多 5 次失败
    lockTime = 15 * 60 * 1000, // 锁定 15 分钟
  } = options

  return async (ctx: Context, next: Next) => {
    const ip = ctx.ip
    const now = Date.now()
    const record = loginAttempts.get(ip)

    // 检查是否被锁定
    if (record && record.lockUntil && now < record.lockUntil) {
      const remainMinutes = Math.ceil((record.lockUntil - now) / 60000)
      ctx.status = 429
      ctx.body = {
        success: false,
        message: `登录失败次数过多，请 ${remainMinutes} 分钟后再试`,
        error: `登录失败次数过多，请 ${remainMinutes} 分钟后再试`,
      }
      return
    }

    await next()

    // 登录失败时记录
    if (ctx.status === 400 && ctx.path === '/api/auth/login') {
      if (!record || now > (record.lockUntil || 0) + windowMs) {
        loginAttempts.set(ip, { count: 1, lockUntil: 0 })
      } else {
        record.count++
        if (record.count >= max) {
          record.lockUntil = now + lockTime
        }
      }
    }

    // 登录成功时清除记录
    if (ctx.status === 200 && ctx.path === '/api/auth/login') {
      loginAttempts.delete(ip)
    }
  }
}