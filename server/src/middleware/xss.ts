import { Context, Next } from 'koa'

/**
 * XSS 过滤中间件
 */
export async function xssFilter(ctx: Context, next: Next) {
  await next()

  // 设置安全响应头
  ctx.set('X-XSS-Protection', '1; mode=block')
  ctx.set('X-Content-Type-Options', 'nosniff')
  ctx.set('X-Frame-Options', 'DENY')
}

/**
 * 过滤 HTML 标签
 */
export function sanitizeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * 过滤评论内容
 */
export function sanitizeComment(content: string): string {
  // 允许部分安全的 HTML，过滤危险标签
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
}

/**
 * 敏感词过滤
 */
const sensitiveWords = ['fuck', 'shit', 'damn']

export function filterSensitiveWords(str: string): string {
  let result = str
  sensitiveWords.forEach((word) => {
    const regex = new RegExp(word, 'gi')
    result = result.replace(regex, '*'.repeat(word.length))
  })
  return result
}