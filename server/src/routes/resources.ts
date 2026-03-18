import Router from 'koa-router'
import { prisma } from '../lib/prisma'
import koaMulter, { diskStorage } from '@koa/multer'
import path from 'path'
import fs from 'fs'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const router = new Router()

// 配置文件上传
const storage = diskStorage({
  destination: (req: any, file: any, cb: (error: Error | null, destination: string) => void) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    
    const uploadDir = path.join(process.cwd(), 'uploads', 'resources', String(year), month, day)
    
    // 创建目录
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    cb(null, uploadDir)
  },
  filename: (req: any, file: any, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname)
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`
    cb(null, uniqueName)
  }
})

const upload = koaMulter({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB
  }
})

// 获取分类
function getCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word')) return 'document'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('7z')) return 'archive'
  if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('python') || mimeType.includes('java')) return 'code'
  return 'other'
}

// 获取资源列表
router.get('/', authMiddleware, adminMiddleware, async (ctx) => {
  const { page = 1, pageSize = 20, type, category, search } = ctx.query

  const where: any = {}
  if (type) where.type = type
  if (category) where.category = category
  if (search) {
    where.name = { contains: search as string, mode: 'insensitive' }
  }

  const [total, list] = await Promise.all([
    prisma.resource.count({ where }),
    prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    }),
  ])

  ctx.body = {
    status: 'success',
    data: {
      list,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    },
  }
})

// 获取单个资源
router.get('/:id', authMiddleware, adminMiddleware, async (ctx) => {
  const { id } = ctx.params

  const resource = await prisma.resource.findUnique({ where: { id } })

  if (!resource) {
    ctx.status = 404
    ctx.body = { status: 'error', message: '资源不存在' }
    return
  }

  ctx.body = { status: 'success', data: resource }
})

// 上传文件
router.post('/upload', authMiddleware, adminMiddleware, upload.single('file'), async (ctx) => {
  const file = (ctx as any).file

  if (!file) {
    ctx.status = 400
    ctx.body = { status: 'error', message: '请选择文件' }
    return
  }

  const relativePath = path.relative(path.join(process.cwd(), 'uploads'), file.path)

  const resource = await prisma.resource.create({
    data: {
      name: file.originalname,
      type: 'file',
      mimeType: file.mimetype,
      size: file.size,
      path: relativePath,
      category: getCategory(file.mimetype),
    },
  })

  ctx.body = { status: 'success', data: resource }
})

// 创建文本
router.post('/text', authMiddleware, adminMiddleware, async (ctx) => {
  const { name, content, category } = ctx.request.body as any

  if (!name || !content) {
    ctx.status = 400
    ctx.body = { status: 'error', message: '名称和内容不能为空' }
    return
  }

  const resource = await prisma.resource.create({
    data: {
      name,
      type: 'text',
      content,
      category: category || 'document',
      size: Buffer.byteLength(content, 'utf8'),
    },
  })

  ctx.body = { status: 'success', data: resource }
})

// 更新资源
router.put('/:id', authMiddleware, adminMiddleware, async (ctx) => {
  const { id } = ctx.params
  const { name, content } = ctx.request.body as any

  const resource = await prisma.resource.findUnique({ where: { id } })
  if (!resource) {
    ctx.status = 404
    ctx.body = { status: 'error', message: '资源不存在' }
    return
  }

  const updateData: any = { name }
  if (resource.type === 'text' && content !== undefined) {
    updateData.content = content
    updateData.size = Buffer.byteLength(content, 'utf8')
  }

  const updated = await prisma.resource.update({
    where: { id },
    data: updateData,
  })

  ctx.body = { status: 'success', data: updated }
})

// 删除资源
router.delete('/:id', authMiddleware, adminMiddleware, async (ctx) => {
  const { id } = ctx.params

  const resource = await prisma.resource.findUnique({ where: { id } })
  if (!resource) {
    ctx.status = 404
    ctx.body = { status: 'error', message: '资源不存在' }
    return
  }

  // 删除文件
  if (resource.type === 'file' && resource.path) {
    const filePath = path.join(process.cwd(), 'uploads', resource.path)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }

  await prisma.resource.delete({ where: { id } })

  ctx.body = { status: 'success', message: '删除成功' }
})

// 下载文件
router.get('/:id/download', authMiddleware, adminMiddleware, async (ctx) => {
  const { id } = ctx.params

  const resource = await prisma.resource.findUnique({ where: { id } })
  if (!resource) {
    ctx.status = 404
    ctx.body = { status: 'error', message: '资源不存在' }
    return
  }

  if (resource.type === 'text') {
    // 文本类型直接返回内容
    ctx.set('Content-Type', 'text/plain; charset=utf-8')
    ctx.set('Content-Disposition', `attachment; filename="${encodeURIComponent(resource.name)}"`)
    ctx.body = resource.content
  } else if (resource.path) {
    // 文件类型
    const filePath = path.join(process.cwd(), 'uploads', resource.path)
    if (!fs.existsSync(filePath)) {
      ctx.status = 404
      ctx.body = { status: 'error', message: '文件不存在' }
      return
    }

    // 更新下载次数
    await prisma.resource.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    })

    ctx.set('Content-Type', resource.mimeType || 'application/octet-stream')
    ctx.set('Content-Disposition', `attachment; filename="${encodeURIComponent(resource.name)}"`)
    ctx.body = fs.createReadStream(filePath)
  }
})

// 统计信息
router.get('/stats/overview', authMiddleware, adminMiddleware, async (ctx) => {
  const [totalFiles, totalTexts, totalSize, categories] = await Promise.all([
    prisma.resource.count({ where: { type: 'file' } }),
    prisma.resource.count({ where: { type: 'text' } }),
    prisma.resource.aggregate({
      _sum: { size: true },
      where: { type: 'file' },
    }),
    prisma.resource.groupBy({
      by: ['category'],
      _count: { id: true },
    }),
  ])

  ctx.body = {
    status: 'success',
    data: {
      totalFiles,
      totalTexts,
      totalSize: totalSize._sum.size || 0,
      categories: categories.map(c => ({
        category: c.category,
        count: c._count.id,
      })),
    },
  }
})

export default router