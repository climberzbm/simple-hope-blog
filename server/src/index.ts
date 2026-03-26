import Koa from "koa"
import Router from "koa-router"
import { koaBody } from "koa-body"
import cors from "@koa/cors"
import helmet from "koa-helmet"
import serve from "koa-static"
import path from "path"
import dotenv from "dotenv"

import { errorHandler, requestLogger } from "./middleware/error"
import { rateLimit, loginRateLimit } from "./middleware/rateLimit"
import { xssFilter } from "./middleware/xss"
import { logger } from "./lib/logger"

import authRoutes from "./routes/auth"
import postRoutes from "./routes/posts"
import categoryRoutes from "./routes/categories"
import tagRoutes from "./routes/tags"
import commentRoutes from "./routes/comments"
import likeRoutes from "./routes/likes"
import mediaRoutes from "./routes/media"
import statsRoutes from "./routes/stats"
import settingsRoutes from "./routes/settings"
import resourceRoutes from "./routes/resources"
import friendLinkRoutes from "./routes/friend-links"
import seriesRoutes from "./routes/series"

dotenv.config()

const app = new Koa()
const router = new Router()

app.use(errorHandler)
app.use(requestLogger)
app.use(helmet())
app.use(xssFilter)
app.use(cors())
app.use(koaBody({ multipart: true, formidable: { maxFileSize: 1024 * 1024 * 1024 } }))
app.use(serve(path.join(__dirname, "../uploads")))
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }))
app.use(loginRateLimit({ max: 5, lockTime: 15 * 60 * 1000 }))

router.get("/api/health", (ctx) => {
  ctx.body = { status: "ok", message: "Simple Hope Blog API", timestamp: new Date().toISOString() }
})

router.use("/api/auth", authRoutes.routes())
router.use("/api/posts", postRoutes.routes())
router.use("/api/categories", categoryRoutes.routes())
router.use("/api/tags", tagRoutes.routes())
router.use("/api/comments", commentRoutes.routes())
router.use("/api/likes", likeRoutes.routes())
router.use("/api/media", mediaRoutes.routes())
router.use("/api/stats", statsRoutes.routes())
router.use("/api/settings", settingsRoutes.routes())
router.use("/api/resources", resourceRoutes.routes())
router.use("/api/friend-links", friendLinkRoutes.routes())
router.use("/api/series", seriesRoutes.routes())

app.use(router.routes()).use(router.allowedMethods())

app.use((ctx) => {
  ctx.status = 404
  ctx.body = { success: false, message: "Not Found" }
})

app.on("error", (err) => logger.error("Server Error:", err))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => logger.info("🚀 Server running on http://localhost:" + PORT))