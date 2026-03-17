'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SPEED = 150

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Position = { x: number; y: number }

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [highScore, setHighScore] = useState(0)

  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }])
  const foodRef = useRef<Position>({ x: 15, y: 15 })
  const directionRef = useRef<Direction>('RIGHT')
  const gameLoopRef = useRef<NodeJS.Timeout>()

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
    foodRef.current = newFood
  }, [])

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }]
    directionRef.current = 'RIGHT'
    setScore(0)
    setGameOver(false)
    generateFood()
  }, [generateFood])

  const startGame = useCallback(() => {
    resetGame()
    setIsPlaying(true)
  }, [resetGame])

  const endGame = useCallback(() => {
    setIsPlaying(false)
    setGameOver(true)
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('snake-high-score', String(score))
    }
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
    }
  }, [score, highScore])

  useEffect(() => {
    const saved = localStorage.getItem('snake-high-score')
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
      ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE)

      // Draw grid
      ctx.strokeStyle = '#2a2a3e'
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath()
        ctx.moveTo(i * CELL_SIZE, 0)
        ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, i * CELL_SIZE)
        ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE)
        ctx.stroke()
      }

      // Draw food
      ctx.fillStyle = '#ff6b6b'
      ctx.beginPath()
      ctx.arc(
        foodRef.current.x * CELL_SIZE + CELL_SIZE / 2,
        foodRef.current.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
      )
      ctx.fill()

      // Draw snake
      snakeRef.current.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e'
        ctx.fillRect(
          segment.x * CELL_SIZE + 1,
          segment.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2
        )
      })
    }

    const move = () => {
      const snake = snakeRef.current
      const head = { ...snake[0] }

      switch (directionRef.current) {
        case 'UP': head.y--; break
        case 'DOWN': head.y++; break
        case 'LEFT': head.x--; break
        case 'RIGHT': head.x++; break
      }

      // Check collision with walls
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        endGame()
        return
      }

      // Check collision with self
      if (snake.some(s => s.x === head.x && s.y === head.y)) {
        endGame()
        return
      }

      snake.unshift(head)

      // Check if ate food
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore(s => s + 10)
        generateFood()
      } else {
        snake.pop()
      }

      draw()
    }

    draw()

    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(move, INITIAL_SPEED)
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [isPlaying, gameOver, generateFood, endGame])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying) return
      
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        s: 'DOWN',
        a: 'LEFT',
        d: 'RIGHT',
      }

      const newDir = keyMap[e.key]
      if (!newDir) return

      const opposites: Record<Direction, Direction> = {
        UP: 'DOWN',
        DOWN: 'UP',
        LEFT: 'RIGHT',
        RIGHT: 'LEFT',
      }

      if (opposites[newDir] !== directionRef.current) {
        directionRef.current = newDir
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isPlaying])

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-8 text-center">
        <div>
          <div className="text-2xl font-bold text-green-500">{score}</div>
          <div className="text-sm text-gray-500">分数</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-500">{highScore}</div>
          <div className="text-sm text-gray-500">最高分</div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="border-2 border-gray-700 rounded-lg"
      />

      <div className="mt-4 space-x-4">
        {!isPlaying && (
          <button
            onClick={startGame}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {gameOver ? '再玩一次' : '开始游戏'}
          </button>
        )}
      </div>

      {isPlaying && (
        <p className="mt-4 text-gray-500 text-sm">
          使用方向键或 WASD 控制方向
        </p>
      )}

      {gameOver && (
        <p className="mt-4 text-red-500 font-semibold">游戏结束！</p>
      )}
    </div>
  )
}