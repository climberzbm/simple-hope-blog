import Koa from 'koa'
import Router from 'koa-router'
import { koaBody } from 'koa-body'
import cors from '@koa/cors'
import helmet from 'koa-helmet'
import serve from 'koa-static'
import path from 'path'
import dotenv from 'dotenv'

import { errorHandler, requestLogger } from './middleware/error'
import { logger } from './lib/logger'

// 导入路由
import authRoutes from './routes/auth'
import postRoutes from './routes/posts'
import categoryRoutes from './routes/categories'
import tagRoutes from './routes/tags'
import commentRoutes from './routes/comments'
import likeRoutes from './routes/likes'
import mediaRoutes from './routes/media'
import statsRoutes from './routes/stats'
import settingsRoutes from './routes/settings'

dotenv.config()

const app = new Koa()
const router = new Router()

// 中间件
app.use(errorHandler)
app.use(requestLogger)
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}))
app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
}))
app.use(serve(path.join(__dirname, '../uploads')))

// 健康检查
router.get('/api/health', (ctx) => {
  ctx.body = {
    status: 'ok',
    message: 'Simple Hope Blog API is running',
    timestamp: new Date().toISOString(),
  }
})

// 注册路由
router.use('/api/auth', authRoutes.routes())
router.use('/api/posts', postRoutes.routes())
router.use('/api/categories', categoryRoutes.routes())
router.use('/api/tags', tagRoutes.routes())
router.use('/api/comments', commentRoutes.routes())
router.use('/api/likes', likeRoutes.routes())
router.use('/api/media', mediaRoutes.routes())
router.use('/api/stats', statsRoutes.routes())
router.use('/api/settings', settingsRoutes.routes())

app.use(router.routes()).use(router.allowedMethods())

// 404 处理
app.use((ctx) => {
  ctx.status = 404
  ctx.body = { success: false, message: 'Not Found' }
})

// 错误处理
app.on('error', (err) => {
  logger.error('Server Error:', err)
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`)
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api/health`)
})