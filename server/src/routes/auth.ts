import Router from 'koa-router'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type ms from 'ms'
import { prisma } from '../lib/prisma'
import { Response } from '../lib/response'
import { validate } from '../middleware/validate'
import { authMiddleware } from '../middleware/auth'
import { registerSchema, loginSchema, changePasswordSchema, updateProfileSchema } from '../validators/auth'

const router = new Router()
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as ms.StringValue

/**
 * 用户注册
 */
router.post('/register', validate(registerSchema), async (ctx) => {
  const { username, email, password } = ctx.state.validatedData

  // 检查用户是否存在
  const existUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })

  if (existUser) {
    return Response.error(ctx, existUser.email === email ? '邮箱已被注册' : '用户名已被使用', 400)
  }

  // 创建用户
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      nickname: username,
    },
    select: {
      id: true,
      username: true,
      email: true,
      nickname: true,
      avatar: true,
      bio: true,
      role: true,
      createdAt: true,
    },
  })

  // 生成 token
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })

  Response.success(ctx, { user, token }, '注册成功')
})

/**
 * 用户登录
 */
router.post('/login', validate(loginSchema), async (ctx) => {
  const { email, password } = ctx.state.validatedData

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return Response.error(ctx, '用户不存在', 400)
  }

  // 验证密码
  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return Response.error(ctx, '密码错误', 400)
  }

  // 检查状态
  if (user.status === 'banned') {
    return Response.error(ctx, '账号已被封禁', 403)
  }

  // 生成 token
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })

  Response.success(ctx, {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
    },
    token,
  }, '登录成功')
})

/**
 * 获取当前用户信息
 */
router.get('/me', authMiddleware, async (ctx) => {
  const user = await prisma.user.findUnique({
    where: { id: ctx.state.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      nickname: true,
      avatar: true,
      bio: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  Response.success(ctx, user)
})

/**
 * 更新用户资料
 */
router.put('/profile', authMiddleware, validate(updateProfileSchema), async (ctx) => {
  const { nickname, avatar, bio } = ctx.state.validatedData

  const user = await prisma.user.update({
    where: { id: ctx.state.user.id },
    data: { nickname, avatar, bio },
    select: {
      id: true,
      username: true,
      email: true,
      nickname: true,
      avatar: true,
      bio: true,
      role: true,
    },
  })

  Response.success(ctx, user, '资料更新成功')
})

/**
 * 修改密码
 */
router.put('/password', authMiddleware, validate(changePasswordSchema), async (ctx) => {
  const { oldPassword, newPassword } = ctx.state.validatedData

  const user = await prisma.user.findUnique({
    where: { id: ctx.state.user.id },
  })

  if (!user) {
    return Response.error(ctx, '用户不存在', 400)
  }

  // 验证旧密码
  const isValid = await bcrypt.compare(oldPassword, user.password)
  if (!isValid) {
    return Response.error(ctx, '旧密码错误', 400)
  }

  // 更新密码
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })

  Response.success(ctx, null, '密码修改成功')
})

export default router