import Router from 'koa-router'
import { prisma } from '../lib/prisma'
import { Response } from '../lib/response'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const router = new Router()

// 标签列表（公开）
router.get('/', async (ctx) => {
  const tags = await prisma.tag.findMany({
    include: {
      _count: { select: { posts: { where: { post: { status: 'published' } } } } },
    },
    orderBy: { createdAt: 'asc' },
  })

  Response.success(ctx, tags.map((t) => ({ ...t, postCount: t._count.posts })))
})

// 创建标签
router.post('/', authMiddleware, adminMiddleware, async (ctx) => {
  const { name } = ctx.request.body as any

  if (!name) {
    return Response.error(ctx, '标签名称不能为空', 400)
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')

  const exist = await prisma.tag.findFirst({ where: { OR: [{ name }, { slug }] } })
  if (exist) {
    return Response.error(ctx, '标签已存在', 400)
  }

  const tag = await prisma.tag.create({
    data: { name, slug },
  })

  Response.success(ctx, tag, '标签创建成功')
})

// 删除标签
router.delete('/:id', authMiddleware, adminMiddleware, async (ctx) => {
  const { id } = ctx.params

  await prisma.tag.delete({ where: { id } })

  Response.success(ctx, null, '标签删除成功')
})

export default router