import Router from 'koa-router'
import path from 'path'
import fs from 'fs'
import { prisma } from '../lib/prisma'
import { Response } from '../lib/response'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const router = new Router()

// 上传图片
router.post('/upload', authMiddleware, adminMiddleware, async (ctx) => {
  const file = ctx.request.files?.file

  if (!file || Array.isArray(file)) {
    return Response.error(ctx, '请上传文件', 400)
  }

  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.mimetype || '')) {
    return Response.error(ctx, '只支持 jpg/png/gif/webp 格式', 400)
  }

  // 检查文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return Response.error(ctx, '文件大小不能超过 5MB', 400)
  }

  // 生成文件名
  const ext = path.extname(file.originalFilename || '.jpg')
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const uploadDir = path.join(__dirname, '../../uploads')

  // 确保目录存在
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // 移动文件
  const filepath = path.join(uploadDir, filename)
  fs.copyFileSync(file.filepath, filepath)
  fs.unlinkSync(file.filepath)

  // 保存到数据库
  const media = await prisma.media.create({
    data: {
      filename,
      url: `/uploads/${filename}`,
      size: file.size,
      mimeType: file.mimetype || 'image/jpeg',
    },
  })

  Response.success(ctx, media, '上传成功')
})

// 媒体列表
router.get('/', authMiddleware, adminMiddleware, async (ctx) => {
  const { page = '1', pageSize = '20' } = ctx.query as any

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    }),
    prisma.media.count(),
  ])

  Response.paginate(ctx, media, total, Number(page), Number(pageSize))
})

// 删除媒体
router.delete('/:id', authMiddleware, adminMiddleware, async (ctx) => {
  const { id } = ctx.params

  const media = await prisma.media.findUnique({ where: { id } })
  if (!media) {
    return Response.error(ctx, '文件不存在', 404)
  }

  // 删除文件
  const filepath = path.join(__dirname, '../../uploads', media.filename)
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath)
  }

  // 删除记录
  await prisma.media.delete({ where: { id } })

  Response.success(ctx, null, '删除成功')
})

export default router