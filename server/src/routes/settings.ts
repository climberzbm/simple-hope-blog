import Router from 'koa-router'
import { prisma } from '../lib/prisma'
import { Response } from '../lib/response'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const router = new Router()

// 获取设置
router.get('/', async (ctx) => {
  const settings = await prisma.setting.findMany()
  const result: Record<string, string> = {}
  settings.forEach((s) => {
    result[s.key] = s.value
  })

  Response.success(ctx, result)
})

// 更新设置
router.put('/', authMiddleware, adminMiddleware, async (ctx) => {
  const data = ctx.request.body as Record<string, string>

  for (const [key, value] of Object.entries(data)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  }

  Response.success(ctx, null, '设置更新成功')
})

// 获取关于页内容
router.get('/about', async (ctx) => {
  const setting = await prisma.setting.findUnique({
    where: { key: 'about_content' },
  })

  Response.success(ctx, { content: setting?.value || '' })
})

// 更新关于页内容
router.put('/about', authMiddleware, adminMiddleware, async (ctx) => {
  const { content } = ctx.request.body as any

  await prisma.setting.upsert({
    where: { key: 'about_content' },
    update: { value: content },
    create: { key: 'about_content', value: content },
  })

  Response.success(ctx, null, '关于页更新成功')
})

export default router