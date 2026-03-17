import { Context, Next } from 'koa'
import { logger } from '../lib/logger'

/**
 * 错误处理中间件
 */
export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next()
  } catch (error: any) {
    logger.error(`Error: ${error.message}`)
    logger.error(error.stack)

    ctx.status = error.status || 500
    ctx.body = {
      success: false,
      message: error.message || '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  }
}

/**
 * 请求日志中间件
 */
export async function requestLogger(ctx: Context, next: Next) {
  const start = Date.now()
  await next()
  const duration = Date.now() - start
  logger.info(`${ctx.method} ${ctx.url} ${ctx.status} - ${duration}ms`)
}