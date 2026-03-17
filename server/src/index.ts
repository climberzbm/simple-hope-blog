import Koa from 'koa'
import Router from 'koa-router'
import { koaBody } from 'koa-body'
import cors from '@koa/cors'
import helmet from 'koa-helmet'
import serve from 'koa-static'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const app = new Koa()
const router = new Router()

// 中间件
app.use(helmet())
app.use(cors())
app.use(koaBody({ multipart: true }))
app.use(serve(path.join(__dirname, '../uploads')))

// 健康检查
router.get('/api/health', (ctx) => {
  ctx.body = { status: 'ok', message: 'Simple Hope Blog API is running' }
})

// 注册路由
app.use(router.routes()).use(router.allowedMethods())

// 错误处理
app.on('error', (err) => {
  console.error('Server Error:', err)
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
})