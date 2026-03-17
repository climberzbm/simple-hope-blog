import { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'
import { Response } from '../lib/response'
import { prisma } from '../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'

export interface JwtPayload {
  userId: string
  role: string
  iat: number
  exp: number
}

/**
 * JWT 认证中间件
 */
export async function authMiddleware(ctx: Context, next: Next) {
  const token = ctx.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return Response.error(ctx, '未登录，请先登录', 401)
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, email: true, role: true, status: true },
    })

    if (!user) {
      return Response.error(ctx, '用户不存在', 401)
    }

    if (user.status === 'banned') {
      return Response.error(ctx, '账号已被封禁', 403)
    }

    ctx.state.user = user
    await next()
  } catch (error) {
    return Response.error(ctx, 'Token 无效或已过期', 401)
  }
}

/**
 * 管理员权限中间件
 */
export async function adminMiddleware(ctx: Context, next: Next) {
  const user = ctx.state.user

  if (!user || user.role !== 'admin') {
    return Response.error(ctx, '无权限访问', 403)
  }

  await next()
}