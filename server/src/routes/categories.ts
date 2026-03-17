import Router from 'koa-router'
import { prisma } from '../lib/prisma'
import { Response } from '../lib/response'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { z } from 'zod'

const router = new Router()

const categorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空').max(50, '分类名称最多50个字符'),
})

// 分类列表（公开）
router.get('/', async (ctx) => {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { posts: { where: { status: 'published' } } } },
    },
    orderBy: { createdAt: 'asc' },
  })

  Response.success(ctx, categories.map((c) => ({ ...c, postCount: c._count.posts })))
})

// 创建分类
router.post('/', authMiddleware, adminMiddleware, async (ctx) => {
  const { name } = ctx.request.body as any

  if (!name) {
    return Response.error(ctx, '分类名称不能为空', 400)
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')

  const exist = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } })
  if (exist) {
    return Response.error(ctx, '分类已存在', 400)
  }

  const category = await prisma.category.create({
    data: { name, slug },
  })

  Response.success(ctx, category, '分类创建成功')
})

// 更新分类
router.put('/:id', authMiddleware, adminMiddleware, async (ctx) => {
  const { id } = ctx.params
  const { name } = ctx.request.body as any

  if (!name) {
    return Response.error(ctx, '分类名称不能为空', 400)
  }

  const category = await prisma.category.update({
    where: { id },
    data: { name },
  })

  Response.success(ctx, category, '分类更新成功')
})

// 删除分类
router.delete('/:id', authMiddleware, adminMiddleware, async (ctx) => {
  const { id } = ctx.params

  await prisma.category.delete({ where: { id } })

  Response.success(ctx, null, '分类删除成功')
})

export default router