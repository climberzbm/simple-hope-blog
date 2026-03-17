import Router from 'koa-router'
import { prisma } from '../lib/prisma'
import { Response } from '../lib/response'
import { authMiddleware } from '../middleware/auth'

const router = new Router()

// 点赞/取消点赞
router.post('/:postId', authMiddleware, async (ctx) => {
  const { postId } = ctx.params
  const userId = ctx.state.user.id

  // 检查文章
  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) {
    return Response.error(ctx, '文章不存在', 404)
  }

  // 检查是否已点赞
  const existLike = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  if (existLike) {
    // 取消点赞
    await prisma.like.delete({ where: { id: existLike.id } })
    await prisma.post.update({
      where: { id: postId },
      data: { likeCount: { decrement: 1 } },
    })
    Response.success(ctx, { liked: false }, '取消点赞')
  } else {
    // 点赞
    await prisma.like.create({
      data: { userId, postId },
    })
    await prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    })
    Response.success(ctx, { liked: true }, '点赞成功')
  }
})

// 获取用户点赞状态
router.get('/:postId/status', authMiddleware, async (ctx) => {
  const { postId } = ctx.params
  const userId = ctx.state.user.id

  const like = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  Response.success(ctx, { liked: !!like })
})

export default router