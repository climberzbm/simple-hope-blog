import Router from 'koa-router'
import axios from 'axios'

const router = new Router()

// ROM 代理 - 解决 CORS 问题
const ROM_SOURCES: Record<string, string> = {
  'gb/geometrix': 'https://github.com/AntonioND/geometrix/releases/download/v1.0/geometrix.gb',
  'gb/ucity': 'https://github.com/AntonioND/ucity/releases/download/v1.0/ucity.gb',
  'gb/libbet': 'https://github.com/pinobatch/libbet/releases/download/v0.06/libbet.gb',
  'gb/caru': 'https://github.com/Hacktix/caru/releases/download/v1.0.0/Caru.gb',
}

router.get('/rom/:system/:gameId', async (ctx) => {
  const { system, gameId } = ctx.params
  const key = `${system}/${gameId}`
  const url = ROM_SOURCES[key]

  if (!url) {
    ctx.status = 404
    ctx.body = { error: 'ROM not found' }
    return
  }

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
    })

    ctx.set('Content-Type', 'application/octet-stream')
    ctx.set('Cache-Control', 'public, max-age=86400')
    ctx.body = Buffer.from(response.data)
  } catch (error: any) {
    ctx.status = 500
    ctx.body = { error: 'Failed to fetch ROM' }
  }
})

export default router