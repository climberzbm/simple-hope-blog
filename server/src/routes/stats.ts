import Router from 'koa-router'
import { prisma } from '../lib/prisma'
import { Response } from '../lib/response'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const router = new Router()

// 仪表盘统计
router.get('/dashboard', authMiddleware, adminMiddleware, async (ctx) => {
  const [
    postCount,
    publishedCount,
    commentCount,
    userCount,
    totalViews,
    totalLikes,
    recentPosts,
    recentComments,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'published' } }),
    prisma.comment.count({ where: { status: 'approved' } }),
    prisma.user.count({ where: { role: 'user' } }),
    prisma.post.aggregate({ _sum: { viewCount: true } }),
    prisma.post.aggregate({ _sum: { likeCount: true } }),
    prisma.post.findMany({
      where: { status: 'published' },
      select: { id: true, title: true, viewCount: true, likeCount: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.comment.findMany({
      where: { status: 'approved' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { nickname: true } },
        post: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  Response.success(ctx, {
    postCount,
    publishedCount,
    commentCount,
    userCount,
    totalViews: totalViews._sum.viewCount || 0,
    totalLikes: totalLikes._sum.likeCount || 0,
    recentPosts,
    recentComments,
  })
})

export default router