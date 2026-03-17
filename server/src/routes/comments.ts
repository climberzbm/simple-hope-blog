import Router from 'koa-router'
import { prisma } from '../lib/prisma'
import { Response } from '../lib/response'
import { validate } from '../middleware/validate'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { createCommentSchema, commentQuerySchema } from '../validators/comment'

const router = new Router()

// 获取文章评论（公开）
router.get('/post/:postId', validate(commentQuerySchema, 'query'), async (ctx) => {
  const { postId } = ctx.params
  const { page, pageSize } = ctx.state.validatedData

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: {
        postId,
        status: 'approved',
        parentId: null,
      },
      include: {
        user: { select: { id: true, username: true, nickname: true, avatar: true } },
        replies: {
          include: {
            user: { select: { id: true, username: true, nickname: true, avatar: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.comment.count({
      where: { postId, status: 'approved', parentId: null },
    }),
  ])

  Response.paginate(ctx, comments, total, page, pageSize)
})

// 发表评论
router.post('/', authMiddleware, validate(createCommentSchema), async (ctx) => {
  const { content, parentId } = ctx.state.validatedData
  const { postId } = ctx.request.body as any

  if (!postId) {
    return Response.error(ctx, '文章ID不能为空', 400)
  }

  // 检查文章是否存在且允许评论
  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) {
    return Response.error(ctx, '文章不存在', 404)
  }

  if (!post.allowComment) {
    return Response.error(ctx, '该文章已关闭评论', 400)
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      userId: ctx.state.user.id,
      parentId: parentId || null,
      status: 'approved', // 默认直接通过，可改为 'pending' 需审核
    },
    include: {
      user: { select: { id: true, username: true, nickname: true, avatar: true } },
    },
  })

  // 更新评论数
  await prisma.post.update({
    where: { id: postId },
    data: { commentCount: { increment: 1 } },
  })

  Response.success(ctx, comment, '评论发表成功')
})

// 删除评论（用户删除自己的评论）
router.delete('/:id', authMiddleware, async (ctx) => {
  const { id } = ctx.params

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { post: true },
  })

  if (!comment) {
    return Response.error(ctx, '评论不存在', 404)
  }

  // 只有评论者本人或管理员可以删除
  if (comment.userId !== ctx.state.user.id && ctx.state.user.role !== 'admin') {
    return Response.error(ctx, '无权删除此评论', 403)
  }

  await prisma.comment.delete({ where: { id } })

  // 更新评论数
  await prisma.post.update({
    where: { id: comment.postId },
    data: { commentCount: { decrement: 1 } },
  })

  Response.success(ctx, null, '评论删除成功')
})

// 管理端评论列表
router.get('/admin/list', authMiddleware, adminMiddleware, validate(commentQuerySchema, 'query'), async (ctx) => {
  const { page, pageSize, status } = ctx.state.validatedData

  const where: any = {}
  if (status) where.status = status

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, nickname: true } },
        post: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.comment.count({ where }),
  ])

  Response.paginate(ctx, comments, total, page, pageSize)
})

// 审核评论
router.put('/:id/status', authMiddleware, adminMiddleware, async (ctx) => {
  const { id } = ctx.params
  const { status } = ctx.request.body as any

  if (!['approved', 'spam'].includes(status)) {
    return Response.error(ctx, '无效的状态', 400)
  }

  const comment = await prisma.comment.update({
    where: { id },
    data: { status },
  })

  Response.success(ctx, comment, '评论状态更新成功')
})

export default router