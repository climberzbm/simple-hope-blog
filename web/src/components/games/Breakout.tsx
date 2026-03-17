'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const CANVAS_WIDTH = 320
const CANVAS_HEIGHT = 400
const PADDLE_WIDTH = 70
const BALL_RADIUS = 8
const BRICK_ROWS = 5
const BRICK_COLS = 6

type Ball = { x: number; y: number; dx: number; dy: number }
type Brick = { x: number; y: number; visible: boolean }

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [won, setWon] = useState(false)
  const [highScore, setHighScore] = useState(0)

  const ballRef = useRef<Ball>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, dx: 3, dy: -3 })
  const paddleRef = useRef({ x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2 })
  const bricksRef = useRef<Brick[]>([])
  const gameLoopRef = useRef<number>()

  const BRICK_WIDTH = (CANVAS_WIDTH - 30) / BRICK_COLS
  const BRICK_HEIGHT = 15

  const initBricks = useCallback((): Brick[] => {
    const bricks: Brick[] = []
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: c * (BRICK_WIDTH + 5) + 15,
          y: r * (BRICK_HEIGHT + 5) + 30,
          visible: true,
        })
      }
    }
    return bricks
  }, [BRICK_WIDTH])

  const resetGame = useCallback(() => {
    ballRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, dx: 3, dy: -3 }
    paddleRef.current = { x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2 }
    bricksRef.current = initBricks()
    setScore(0)
    setLives(3)
    setGameOver(false)
    setWon(false)
  }, [initBricks])

  const startGame = useCallback(() => {
    resetGame()
    setIsPlaying(true)
  }, [resetGame])

  useEffect(() => {
    const saved = localStorage.getItem('breakout-high')
    if (saved) setHighScore(Number(saved))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      bricksRef.current.forEach(brick => {
        if (brick.visible) {
          ctx.fillStyle = '#4ade80'
          ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT)
        }
      })

      ctx.fillStyle = '#60a5fa'
      ctx.fillRect(paddleRef.current.x, CANVAS_HEIGHT - 25, PADDLE_WIDTH, 10)

      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(ballRef.current.x, ballRef.current.y, BALL_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    }

    const update = () => {
      if (!isPlaying || gameOver || won) return

      const ball = ballRef.current
      const paddle = paddleRef.current

      ball.x += ball.dx
      ball.y += ball.dy

      if (ball.x + BALL_RADIUS > CANVAS_WIDTH || ball.x - BALL_RADIUS < 0) ball.dx = -ball.dx
      if (ball.y - BALL_RADIUS < 0) ball.dy = -ball.dy

      if (ball.y + BALL_RADIUS > CANVAS_HEIGHT - 25 &&
          ball.x > paddle.x && ball.x < paddle.x + PADDLE_WIDTH) {
        ball.dy = -ball.dy
        ball.dx = 6 * ((ball.x - paddle.x) / PADDLE_WIDTH - 0.5)
      }

      if (ball.y + BALL_RADIUS > CANVAS_HEIGHT) {
        setLives(l => {
          if (l - 1 <= 0) {
            setIsPlaying(false)
            setGameOver(true)
          } else {
            ball.x = CANVAS_WIDTH / 2
            ball.y = CANVAS_HEIGHT - 50
            ball.dx = 3
            ball.dy = -3
          }
          return l - 1
        })
        return
      }

      bricksRef.current.forEach(brick => {
        if (brick.visible &&
            ball.x > brick.x && ball.x < brick.x + BRICK_WIDTH &&
            ball.y > brick.y && ball.y < brick.y + BRICK_HEIGHT) {
          ball.dy = -ball.dy
          brick.visible = false
          setScore(s => s + 10)
        }
      })

      if (bricksRef.current.every(b => !b.visible)) {
        setIsPlaying(false)
        setWon(true)
      }

      draw()
      gameLoopRef.current = requestAnimationFrame(update)
    }

    draw()
    if (isPlaying && !gameOver && !won) {
      gameLoopRef.current = requestAnimationFrame(update)
    }

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [isPlaying, gameOver, won, BRICK_WIDTH])

  // 鼠标/触摸控制
  const handleMove = useCallback((clientX: number) => {
    if (!isPlaying || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    paddleRef.current.x = Math.max(0, Math.min(x - PADDLE_WIDTH / 2, CANVAS_WIDTH - PADDLE_WIDTH))
  }, [isPlaying])

  useEffect(() => {
    const onMouse = (e: MouseEvent) => handleMove(e.clientX)
    const onTouch = (e: TouchEvent) => handleMove(e.touches[0].clientX)

    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchmove', onTouch)
    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [handleMove])

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('breakout-high', String(score))
    }
  }, [score, highScore])

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex gap-6 text-center">
        <div>
          <div className="text-xl font-bold text-green-500">{score}</div>
          <div className="text-xs text-gray-500">分数</div>
        </div>
        <div>
          <div className="text-xl font-bold text-red-500">{lives}</div>
          <div className="text-xs text-gray-500">生命</div>
        </div>
        <div>
          <div className="text-xl font-bold text-yellow-500">{highScore}</div>
          <div className="text-xs text-gray-500">最高</div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-gray-700 rounded-lg touch-none"
      />

      <div className="mt-4">
        {!isPlaying && (
          <button onClick={startGame} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            {gameOver || won ? '再来一次' : '开始'}
          </button>
        )}
      </div>

      {gameOver && <p className="mt-3 text-red-500">游戏结束!</p>}
      {won && <p className="mt-3 text-yellow-500">恭喜过关! 🎉</p>}

      <p className="mt-3 text-gray-500 text-xs">移动手指或鼠标控制挡板</p>
    </div>
  )
}