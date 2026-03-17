import Router from 'koa-router'
import { prisma } from '../lib/prisma'
import { publishArticle } from '../jobs/publish-article'
import { checkAndReplyComments } from '../jobs/check-comments'

const router = new Router()

// API 密钥验证中间件
const validateApiKey = async (ctx: any, next: any) => {
  const apiKey = ctx.headers['x-api-key'] || ctx.query.apiKey
  const validKey = process.env.CRON_API_KEY || 'cron-secret-key'
  
  if (apiKey !== validKey) {
    ctx.status = 401
    ctx.body = { success: false, message: 'Unauthorized' }
    return
  }
  
  await next()
}

// 手动触发发布文章
router.post('/publish-article', validateApiKey, async (ctx) => {
  try {
    const post = await publishArticle()
    ctx.body = { success: true, data: post }
  } catch (error: any) {
    ctx.status = 500
    ctx.body = { success: false, message: error.message }
  }
})

// 手动触发评论检查
router.post('/check-comments', validateApiKey, async (ctx) => {
  try {
    await checkAndReplyComments()
    ctx.body = { success: true, message: 'Comments checked' }
  } catch (error: any) {
    ctx.status = 500
    ctx.body = { success: false, message: error.message }
  }
})

// 定时任务状态
router.get('/status', validateApiKey, async (ctx) => {
  const [lastPublish, lastCommentCheck] = await Promise.all([
    prisma.setting.findUnique({ where: { key: 'last_publish_time' } }),
    prisma.setting.findUnique({ where: { key: 'last_comment_check' } })
  ])
  ctx.body = {
    success: true,
    data: { lastPublish, lastCommentCheck }
  }
})

export default router