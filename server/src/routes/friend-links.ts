import Router from 'koa-router'
import { prisma } from '../lib/prisma'
import { Response } from '../lib/response'
import { validate } from '../middleware/validate'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { z } from 'zod'

const router = new Router()

// 申请友链的验证规则
const applySchema = z.object({
  name: z.string().min(1, '网站名称不能为空').max(50),
  url: z.string().url('请输入有效的网址'),
  avatar: z.string().url('请输入有效的头像地址').optional().nullable(),
  description: z.string().max(200, '描述不能超过200字').optional().nullable(),
})

// 管理员创建友链
const createSchema = z.object({
  name: z.string().min(1).max(50),
  url: z.string().url(),
  avatar: z.string().url().optional().nullable(),
  description: z.string().max(200).optional().nullable(),
  status: z.enum(['pending', 'approved', 'rejected']).default('approved'),
  order: z.number().int().optional(),
})

// 管理员更新友链
const updateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  url: z.string().url().optional(),
  avatar: z.string().url().optional().nullable(),
  description: z.string().max(200).optional().nullable(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  order: z.number().int().optional(),
})

/**
 * 获取友链列表（公开，只返回已通过的）
 */
router.get('/public', async (ctx) => {
  const links = await prisma.friendLink.findMany({
    where: { status: 'approved' },
    orderBy: [{ order: 'desc' }, { createdAt: 'desc' }],
  })

  Response.success(ctx, links)
})

/**
 * 申请友链（公开）
 */
router.post('/apply', validate(applySchema), async (ctx) => {
  const { name, url, avatar, description } = ctx.state.validatedData

  // 检查是否已存在
  const existing = await prisma.friendLink.findFirst({
    where: { url },
  })

  if (existing) {
    return Response.error(ctx, '该网址已在友链列表或申请中', 400)
  }

  const link = await prisma.friendLink.create({
    data: {
      name,
      url,
      avatar,
      description,
      status: 'pending',
    },
  })

  Response.success(ctx, link, '申请已提交，等待审核')
})

/**
 * 管理端：获取所有友链
 */
router.get('/admin/list', authMiddleware, adminMiddleware, async (ctx) => {
  const { status, page = 1, pageSize = 20 } = ctx.query

  const where: any = {}
  if (status) where.status = status

  const [links, total] = await Promise.all([
    prisma.friendLink.findMany({
      where,
      orderBy: [{ order: 'desc' }, { createdAt: 'desc' }],
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    }),
    prisma.friendLink.count({ where }),
  ])

  Response.paginate(ctx, links, total, Number(page), Number(pageSize))
})

/**
 * 管理端：创建友链
 */
router.post('/admin', authMiddleware, adminMiddleware, validate(createSchema), async (ctx) => {
  const data = ctx.state.validatedData

  const link = await prisma.friendLink.create({
    data: {
      name: data.name,
      url: data.url,
      avatar: data.avatar,
      description: data.description,
      status: data.status || 'approved',
      order: data.order || 0,
    },
  })

  Response.success(ctx, link, '友链创建成功')
})

/**
 * 管理端：更新友链
 */
router.put('/admin/:id', authMiddleware, adminMiddleware, validate(updateSchema), async (ctx) => {
  const { id } = ctx.params
  const data = ctx.state.validatedData

  const link = await prisma.friendLink.findUnique({ where: { id } })
  if (!link) {
    return Response.error(ctx, '友链不存在', 404)
  }

  const updated = await prisma.friendLink.update({
    where: { id },
    data,
  })

  Response.success(ctx, updated, '友链更新成功')
})

/**
 * 管理端：删除友链
 */
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (ctx) => {
  const { id } = ctx.params

  const link = await prisma.friendLink.findUnique({ where: { id } })
  if (!link) {
    return Response.error(ctx, '友链不存在', 404)
  }

  await prisma.friendLink.delete({ where: { id } })

  Response.success(ctx, null, '友链删除成功')
})

/**
 * 管理端：批量审核
 */
router.post('/admin/audit', authMiddleware, adminMiddleware, async (ctx) => {
  const { ids, status } = ctx.request.body as { ids: string[]; status: 'approved' | 'rejected' }

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Response.error(ctx, '请选择要审核的友链', 400)
  }

  if (!['approved', 'rejected'].includes(status)) {
    return Response.error(ctx, '无效的审核状态', 400)
  }

  const result = await prisma.friendLink.updateMany({
    where: { id: { in: ids } },
    data: { status },
  })

  Response.success(ctx, { count: result.count }, `已${status === 'approved' ? '通过' : '拒绝'} ${result.count} 个友链`)
})

export default router