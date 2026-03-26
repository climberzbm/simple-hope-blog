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

/**
 * 访问统计（按日期分组）
 */
router.get('/views', authMiddleware, adminMiddleware, async (ctx) => {
  const { days = 7 } = ctx.query
  const daysNum = Math.min(Math.max(Number(days), 1), 90)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysNum)
  startDate.setHours(0, 0, 0, 0)

  // 获取日期范围内的浏览记录
  const views = await prisma.postView.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
    },
  })

  // 按日期分组统计
  const dateMap = new Map<string, number>()
  
  // 初始化所有日期
  for (let i = 0; i <= daysNum; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dateMap.set(dateStr, 0)
  }

  // 统计每天的浏览量
  views.forEach((view) => {
    const dateStr = view.createdAt.toISOString().split('T')[0]
    const current = dateMap.get(dateStr) || 0
    dateMap.set(dateStr, current + 1)
  })

  // 转换为数组并排序
  const result = Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  Response.success(ctx, result)
})

/**
 * 热门文章 TOP 10
 */
router.get('/hot-posts', authMiddleware, adminMiddleware, async (ctx) => {
  const { limit = 10 } = ctx.query
  const limitNum = Math.min(Math.max(Number(limit), 1), 50)

  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    select: {
      id: true,
      title: true,
      slug: true,
      viewCount: true,
      likeCount: true,
      commentCount: true,
      publishedAt: true,
    },
    orderBy: { viewCount: 'desc' },
    take: limitNum,
  })

  Response.success(ctx, posts)
})

/**
 * 访问概览（今日、本周、本月）
 */
router.get('/overview', authMiddleware, adminMiddleware, async (ctx) => {
  const now = new Date()
  
  // 今日
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  // 本周（周一为起始）
  const weekStart = new Date(now)
  const dayOfWeek = weekStart.getDay() || 7
  weekStart.setDate(weekStart.getDate() - dayOfWeek + 1)
  weekStart.setHours(0, 0, 0, 0)

  // 本月
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [todayViews, weekViews, monthViews, totalViews] = await Promise.all([
    prisma.postView.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.postView.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.postView.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.postView.count(),
  ])

  Response.success(ctx, {
    today: todayViews,
    week: weekViews,
    month: monthViews,
    total: totalViews,
  })
})

export default router