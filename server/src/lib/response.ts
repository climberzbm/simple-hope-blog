import { Context } from 'koa'

/**
 * 统一响应格式
 */
export class Response {
  /**
   * 成功响应
   */
  static success(ctx: Context, data?: any, message?: string) {
    ctx.status = 200
    ctx.body = {
      success: true,
      data,
      message: message || '操作成功',
    }
  }

  /**
   * 错误响应
   */
  static error(ctx: Context, message: string, code: number = 400, data?: any) {
    ctx.status = code
    ctx.body = {
      success: false,
      message,
      error: message,
      data,
    }
  }

  /**
   * 分页响应
   */
  static paginate(
    ctx: Context,
    list: any[],
    total: number,
    page: number,
    pageSize: number
  ) {
    ctx.status = 200
    ctx.body = {
      success: true,
      data: {
        list,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    }
  }
}