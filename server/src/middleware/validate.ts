import { Context, Next } from 'koa'
import { ZodSchema } from 'zod'
import { Response } from '../lib/response'

/**
 * Zod 参数校验中间件
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return async (ctx: Context, next: Next) => {
    try {
      const data = source === 'body' ? ctx.request.body : source === 'query' ? ctx.query : ctx.params
      const result = schema.safeParse(data)

      if (!result.success) {
        const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
        return Response.error(ctx, `参数校验失败: ${errors}`, 400)
      }

      ctx.state.validatedData = result.data
      await next()
    } catch (error) {
      return Response.error(ctx, '参数解析失败', 400)
    }
  }
}