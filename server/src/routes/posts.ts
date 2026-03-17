import Router from 'koa-router'
import { prisma } from '../lib/prisma'
import { Response } from '../lib/response'
import { validate } from '../middleware/validate'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { createPostSchema, updatePostSchema, postQuerySchema } from '../validators/post'

const router = new Router()

/**
 * 文章列表（公开）
 */
router.get('/', validate(postQuerySchema, 'query'), async (ctx) => {
  const { page, pageSize, category, tag, keyword } = ctx.state.validatedData

  const where: any = {
    status: 'published',
  }

  // 分类筛选
  if (category) {
    where.category = { slug: category }
  }

  // 标签筛选
  if (tag) {
    where.tags = { some: { tag: { slug: tag } } }
  }

  // 关键词搜索
  if (keyword) {
    where.OR = [
      { title: { contains: keyword, mode: 'insensitive' } },
      { content: { contains: keyword, mode: 'insensitive' } },
    ]
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, nickname: true, avatar: true } },
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: [{ isTop: 'desc' }, { publishedAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where }),
  ])

  Response.paginate(
    ctx,
    posts.map((p) => ({
      ...p,
      tags: p.tags.map((t) => t.tag),
    })),
    total,
    page,
    pageSize
  )
})

/**
 * 文章详情（公开）
 */
router.get('/:slug', async (ctx) => {
  const { slug } = ctx.params

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, username: true, nickname: true, avatar: true } },
      category: true,
      tags: { include: { tag: true } },
    },
  })

  if (!post || post.status !== 'published') {
    return Response.error(ctx, '文章不存在', 404)
  }

  // 增加阅读量
  await prisma.post.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  })

  Response.success(ctx, {
    ...post,
    viewCount: post.viewCount + 1,
    tags: post.tags.map((t) => t.tag),
  })
})

/**
 * 管理端文章列表
 */
router.get('/admin/list', authMiddleware, adminMiddleware, validate(postQuerySchema, 'query'), async (ctx) => {
  const { page, pageSize, status, category, keyword } = ctx.state.validatedData

  const where: any = {}

  if (status) where.status = status
  if (category) where.category = { slug: category }
  if (keyword) {
    where.OR = [
      { title: { contains: keyword, mode: 'insensitive' } },
      { content: { contains: keyword, mode: 'insensitive' } },
    ]
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, nickname: true } },
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: [{ isTop: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where }),
  ])

  Response.paginate(
    ctx,
    posts.map((p) => ({
      ...p,
      tags: p.tags.map((t) => t.tag),
    })),
    total,
    page,
    pageSize
  )
})

/**
 * 创建文章
 */
router.post('/', authMiddleware, adminMiddleware, validate(createPostSchema), async (ctx) => {
  const { title, content, excerpt, cover, categoryId, tagIds, status, isTop, allowComment } = ctx.state.validatedData

  // 生成 slug
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .slice(0, 100) + '-' + Date.now()

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      cover,
      status,
      isTop: isTop || false,
      allowComment: allowComment !== false,
      authorId: ctx.state.user.id,
      categoryId: categoryId || null,
      publishedAt: status === 'published' ? new Date() : null,
      ...(tagIds && {
        tags: {
          create: tagIds.map((tagId: string) => ({ tagId })),
        },
      }),
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  })

  Response.success(ctx, post, '文章创建成功')
})

/**
 * 更新文章
 */
router.put('/:id', authMiddleware, adminMiddleware, validate(updatePostSchema), async (ctx) => {
  const { id } = ctx.params
  const data = ctx.state.validatedData

  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) {
    return Response.error(ctx, '文章不存在', 404)
  }

  const { tagIds, ...updateData } = data

  // 更新文章
  const updated = await prisma.post.update({
    where: { id },
    data: {
      ...updateData,
      publishedAt: data.status === 'published' && !post.publishedAt ? new Date() : post.publishedAt,
      ...(tagIds && {
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId: string) => ({ tagId })),
        },
      }),
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  })

  Response.success(ctx, updated, '文章更新成功')
})

/**
 * 删除文章
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (ctx) => {
  const { id } = ctx.params

  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) {
    return Response.error(ctx, '文章不存在', 404)
  }

  await prisma.post.delete({ where: { id } })

  Response.success(ctx, null, '文章删除成功')
})

export default router