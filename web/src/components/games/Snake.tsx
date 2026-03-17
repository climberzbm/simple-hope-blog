'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const GRID_SIZE = 20
const CELL_SIZE = 15 // 移动端更小

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
    foodRef.current = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
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

  const changeDirection = useCallback((newDir: Direction) => {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
    }
    if (opposites[newDir] !== directionRef.current) {
      directionRef.current = newDir
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('snake-high-score')
    if (saved) setHighScore(Number(saved))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = Math.min(CELL_SIZE * GRID_SIZE, 300)

    const draw = () => {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, size, size)

      ctx.fillStyle = '#ff6b6b'
      ctx.beginPath()
      ctx.arc(
        foodRef.current.x * CELL_SIZE + CELL_SIZE / 2,
        foodRef.current.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 1,
        0, Math.PI * 2
      )
      ctx.fill()

      snakeRef.current.forEach((segment, i) => {
        ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e'
        ctx.fillRect(
          segment.x * CELL_SIZE + 1,
          segment.y * CELL_SIZE + 1,
          CELL_SIZE - 2, CELL_SIZE - 2
        )
      })
    }

    const endGame = () => {
      setIsPlaying(false)
      setGameOver(true)
      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem('snake-high-score', String(score))
      }
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
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

      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        endGame()
        return
      }

      if (snake.some(s => s.x === head.x && s.y === head.y)) {
        endGame()
        return
      }

      snake.unshift(head)

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
      gameLoopRef.current = setInterval(move, 150)
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [isPlaying, gameOver, generateFood, score, highScore])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying) return
      const map: Record<string, Direction> = {
        ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
        w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
      }
      if (map[e.key]) changeDirection(map[e.key])
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isPlaying, changeDirection])

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex gap-6 text-center">
        <div>
          <div className="text-xl font-bold text-green-500">{score}</div>
          <div className="text-xs text-gray-500">分数</div>
        </div>
        <div>
          <div className="text-xl font-bold text-yellow-500">{highScore}</div>
          <div className="text-xs text-gray-500">最高</div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={CELL_SIZE * GRID_SIZE}
        height={CELL_SIZE * GRID_SIZE}
        className="border-2 border-gray-700 rounded-lg"
      />

      {/* 移动端控制按钮 */}
      <div className="mt-4 grid grid-cols-3 gap-2 w-40">
        <div></div>
        <button onClick={() => changeDirection('UP')} className="p-4 bg-gray-700 rounded-lg text-white active:bg-gray-600 text-xl">↑</button>
        <div></div>
        <button onClick={() => changeDirection('LEFT')} className="p-4 bg-gray-700 rounded-lg text-white active:bg-gray-600 text-xl">←</button>
        <button onClick={() => changeDirection('DOWN')} className="p-4 bg-gray-700 rounded-lg text-white active:bg-gray-600 text-xl">↓</button>
        <button onClick={() => changeDirection('RIGHT')} className="p-4 bg-gray-700 rounded-lg text-white active:bg-gray-600 text-xl">→</button>
      </div>

      <div className="mt-4">
        {!isPlaying && (
          <button onClick={startGame} className="px-6 py-2 bg-green-600 text-white rounded-lg">
            {gameOver ? '再来一次' : '开始'}
          </button>
        )}
      </div>

      {gameOver && <p className="mt-3 text-red-500">游戏结束!</p>}
    </div>
  )
}