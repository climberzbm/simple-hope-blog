'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 320
const PADDLE_WIDTH = 80
const PADDLE_HEIGHT = 12
const BALL_RADIUS = 8
const BRICK_ROWS = 4
const BRICK_COLS = 8
const BRICK_WIDTH = 54
const BRICK_HEIGHT = 18
const BRICK_PADDING = 4
const BRICK_OFFSET_TOP = 30
const BRICK_OFFSET_LEFT = 12

type Ball = { x: number; y: number; dx: number; dy: number }
type Paddle = { x: number }
type Brick = { x: number; y: number; visible: boolean }

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [won, setWon] = useState(false)
  const [highScore, setHighScore] = useState(0)

  const ballRef = useRef<Ball>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 40, dx: 4, dy: -4 })
  const paddleRef = useRef<Paddle>({ x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2 })
  const bricksRef = useRef<Brick[]>([])
  const gameLoopRef = useRef<number>()

  const initBricks = useCallback((): Brick[] => {
    const bricks: Brick[] = []
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          visible: true,
        })
      }
    }
    return bricks
  }, [])

  const resetGame = useCallback(() => {
    ballRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 40, dx: 4, dy: -4 }
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

  const endGame = useCallback((win: boolean = false) => {
    setIsPlaying(false)
    if (win) {
      setWon(true)
    } else {
      setGameOver(true)
    }
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('breakout-high-score', String(score))
    }
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }
  }, [score, highScore])

  useEffect(() => {
    const saved = localStorage.getItem('breakout-high-score')
    if (saved) setHighScore(Number(saved))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      // Clear
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw bricks
      bricksRef.current.forEach((brick) => {
        if (brick.visible) {
          const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + BRICK_HEIGHT)
          gradient.addColorStop(0, '#4ade80')
          gradient.addColorStop(1, '#22c55e')
          ctx.fillStyle = gradient
          ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT)
        }
      })

      // Draw paddle
      ctx.fillStyle = '#60a5fa'
      ctx.fillRect(paddleRef.current.x, CANVAS_HEIGHT - 25, PADDLE_WIDTH, PADDLE_HEIGHT)

      // Draw ball
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(ballRef.current.x, ballRef.current.y, BALL_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    }

    const update = () => {
      if (!isPlaying || gameOver || won) return

      const ball = ballRef.current
      const paddle = paddleRef.current
      const bricks = bricksRef.current

      // Move ball
      ball.x += ball.dx
      ball.y += ball.dy

      // Wall collision
      if (ball.x + BALL_RADIUS > CANVAS_WIDTH || ball.x - BALL_RADIUS < 0) {
        ball.dx = -ball.dx
      }
      if (ball.y - BALL_RADIUS < 0) {
        ball.dy = -ball.dy
      }

      // Paddle collision
      if (
        ball.y + BALL_RADIUS > CANVAS_HEIGHT - 25 &&
        ball.x > paddle.x &&
        ball.x < paddle.x + PADDLE_WIDTH
      ) {
        ball.dy = -ball.dy
        const hitPos = (ball.x - paddle.x) / PADDLE_WIDTH
        ball.dx = 8 * (hitPos - 0.5)
      }

      // Bottom - lose life
      if (ball.y + BALL_RADIUS > CANVAS_HEIGHT) {
        setLives((l) => {
          const newLives = l - 1
          if (newLives <= 0) {
            endGame()
          } else {
            ball.x = CANVAS_WIDTH / 2
            ball.y = CANVAS_HEIGHT - 40
            ball.dx = 4
            ball.dy = -4
          }
          return newLives
        })
        return
      }

      // Brick collision
      bricks.forEach((brick) => {
        if (
          brick.visible &&
          ball.x > brick.x &&
          ball.x < brick.x + BRICK_WIDTH &&
          ball.y > brick.y &&
          ball.y < brick.y + BRICK_HEIGHT
        ) {
          ball.dy = -ball.dy
          brick.visible = false
          setScore((s) => s + 10)
        }
      })

      // Check win
      if (bricks.every((b) => !b.visible)) {
        endGame(true)
        return
      }

      draw()
      gameLoopRef.current = requestAnimationFrame(update)
    }

    draw()

    if (isPlaying && !gameOver && !won) {
      gameLoopRef.current = requestAnimationFrame(update)
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [isPlaying, gameOver, won, endGame])

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isPlaying) return
      const canvas = canvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      paddleRef.current.x = Math.max(0, Math.min(x - PADDLE_WIDTH / 2, CANVAS_WIDTH - PADDLE_WIDTH))
    }

    const handleTouch = (e: TouchEvent) => {
      if (!isPlaying) return
      const canvas = canvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const x = e.touches[0].clientX - rect.left
      paddleRef.current.x = Math.max(0, Math.min(x - PADDLE_WIDTH / 2, CANVAS_WIDTH - PADDLE_WIDTH))
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleTouch)
    
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleTouch)
    }
  }, [isPlaying])

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-8 text-center">
        <div>
          <div className="text-2xl font-bold text-green-500">{score}</div>
          <div className="text-sm text-gray-500">分数</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-500">{lives}</div>
          <div className="text-sm text-gray-500">生命</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-500">{highScore}</div>
          <div className="text-sm text-gray-500">最高分</div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-gray-700 rounded-lg cursor-none"
      />

      <div className="mt-4">
        {!isPlaying && (
          <button
            onClick={startGame}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {gameOver || won ? '再玩一次' : '开始游戏'}
          </button>
        )}
      </div>

      {isPlaying && (
        <p className="mt-4 text-gray-500 text-sm">
          移动鼠标或手指控制挡板
        </p>
      )}

      {gameOver && (
        <p className="mt-4 text-red-500 font-semibold">游戏结束！</p>
      )}
      {won && (
        <p className="mt-4 text-yellow-500 font-semibold">恭喜过关！🎉</p>
      )}
    </div>
  )
}