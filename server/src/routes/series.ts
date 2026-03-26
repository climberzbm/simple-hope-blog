import Router from 'koa-router'
import { prisma } from '../lib/prisma'
import { Response } from '../lib/response'
import { validate } from '../middleware/validate'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { z } from 'zod'

const router = new Router()

const createSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'slug 只能包含小写字母、数字和连字符'),
  description: z.string().max(500).optional().nullable(),
  cover: z.string().url().optional().nullable(),
  order: z.number().int().optional(),
})

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional().nullable(),
  cover: z.string().url().optional().nullable(),
  order: z.number().int().optional(),
})

const setPostsSchema = z.object({
  postIds: z.array(z.string()), // 按顺序排列的文章ID
})

/**
 * 获取系列列表（公开）
 */
router.get('/public', async (ctx) => {
  const series = await prisma.series.findMany({
    orderBy: [{ order: 'desc' }, { createdAt: 'desc' }],
    include: {
      _count: { select: { posts: true } },
    },
  })

  Response.success(ctx, series.map(s => ({
    ...s,
    postCount: s._count.posts,
  })))
})

/**
 * 获取系列详情（公开）
 */
router.get('/public/:slug', async (ctx) => {
  const { slug } = ctx.params

  const series = await prisma.series.findUnique({
    where: { slug },
    include: {
      posts: {
        orderBy: { order: 'asc' },
        include: {
          post: {
            include: {
              category: true,
              tags: { include: { tag: true } },
            },
          },
        },
      },
    },
  })

  if (!series) {
    return Response.error(ctx, '系列不存在', 404)
  }

  Response.success(ctx, {
    ...series,
    posts: series.posts.map(ps => ({
      ...ps.post,
      tags: ps.post.tags.map(t => t.tag),
      order: ps.order,
    })),
  })
})

/**
 * 管理端：获取所有系列
 */
router.get('/admin/list', authMiddleware, adminMiddleware, async (ctx) => {
  const series = await prisma.series.findMany({
    orderBy: [{ order: 'desc' }, { createdAt: 'desc' }],
    include: {
      _count: { select: { posts: true } },
    },
  })

  Response.success(ctx, series.map(s => ({
    ...s,
    postCount: s._count.posts,
  })))
})

/**
 * 管理端：创建系列
 */
router.post('/admin', authMiddleware, adminMiddleware, validate(createSchema), async (ctx) => {
  const data = ctx.state.validatedData

  const existing = await prisma.series.findUnique({ where: { slug: data.slug } })
  if (existing) {
    return Response.error(ctx, '该 slug 已存在', 400)
  }

  const series = await prisma.series.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      cover: data.cover,
      order: data.order || 0,
    },
  })

  Response.success(ctx, series, '系列创建成功')
})

/**
 * 管理端：更新系列
 */
router.put('/admin/:id', authMiddleware, adminMiddleware, validate(updateSchema), async (ctx) => {
  const { id } = ctx.params
  const data = ctx.state.validatedData

  const series = await prisma.series.findUnique({ where: { id } })
  if (!series) {
    return Response.error(ctx, '系列不存在', 404)
  }

  if (data.slug && data.slug !== series.slug) {
    const existing = await prisma.series.findUnique({ where: { slug: data.slug } })
    if (existing) {
      return Response.error(ctx, '该 slug 已存在', 400)
    }
  }

  const updated = await prisma.series.update({
    where: { id },
    data,
  })

  Response.success(ctx, updated, '系列更新成功')
})

/**
 * 管理端：删除系列
 */
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (ctx) => {
  const { id } = ctx.params

  const series = await prisma.series.findUnique({ where: { id } })
  if (!series) {
    return Response.error(ctx, '系列不存在', 404)
  }

  await prisma.series.delete({ where: { id } })

  Response.success(ctx, null, '系列删除成功')
})

/**
 * 管理端：设置系列文章
 */
router.post('/admin/:id/posts', authMiddleware, adminMiddleware, validate(setPostsSchema), async (ctx) => {
  const { id } = ctx.params
  const { postIds } = ctx.state.validatedData

  const series = await prisma.series.findUnique({ where: { id } })
  if (!series) {
    return Response.error(ctx, '系列不存在', 404)
  }

  // 先删除旧的关联
  await prisma.postSeries.deleteMany({ where: { seriesId: id } })

  // 创建新的关联
  if (postIds.length > 0) {
    await prisma.postSeries.createMany({
      data: postIds.map((postId, index) => ({
        postId,
        seriesId: id,
        order: index,
      })),
    })
  }

  Response.success(ctx, null, '系列文章更新成功')
})

/**
 * 管理端：获取可选文章（未加入任何系列的文章）
 */
router.get('/admin/:id/available-posts', authMiddleware, adminMiddleware, async (ctx) => {
  const { id } = ctx.params
  const { keyword } = ctx.query

  const where: any = {
    status: 'published',
    series: { none: { seriesId: id } }, // 未加入该系列的文章
  }

  if (keyword) {
    where.title = { contains: String(keyword), mode: 'insensitive' }
  }

  const posts = await prisma.post.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  })

  Response.success(ctx, posts)
})

export default router