'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const CELL_SIZE = 24

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]], // Z
]

const COLORS = ['#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#0000f0', '#00f000', '#f00000']

type Piece = {
  shape: number[][]
  x: number
  y: number
  color: string
}

export default function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [highScore, setHighScore] = useState(0)

  const boardRef = useRef<number[][]>([])
  const pieceRef = useRef<Piece | null>(null)
  const gameLoopRef = useRef<number>()

  const createBoard = useCallback(() => {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  }, [])

  const randomPiece = useCallback((): Piece => {
    const idx = Math.floor(Math.random() * SHAPES.length)
    return {
      shape: SHAPES[idx].map(row => [...row]),
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(SHAPES[idx][0].length / 2),
      y: 0,
      color: COLORS[idx],
    }
  }, [])

  const isValidMove = useCallback((piece: Piece, board: number[][], offsetX = 0, offsetY = 0): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + offsetX
          const newY = piece.y + y + offsetY
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return false
          if (newY >= 0 && board[newY][newX]) return false
        }
      }
    }
    return true
  }, [])

  const mergePiece = useCallback((piece: Piece, board: number[][]): number[][] => {
    const newBoard = board.map(row => [...row])
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] && piece.y + y >= 0) {
          newBoard[piece.y + y][piece.x + x] = 1
        }
      }
    }
    return newBoard
  }, [])

  const clearLines = useCallback((board: number[][]): { newBoard: number[][]; cleared: number } => {
    const newBoard = board.filter(row => row.some(cell => cell === 0))
    const cleared = BOARD_HEIGHT - newBoard.length
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0))
    }
    return { newBoard, cleared }
  }, [])

  const rotatePiece = useCallback((piece: Piece): number[][] => {
    const rows = piece.shape.length
    const cols = piece.shape[0].length
    const rotated: number[][] = []
    for (let x = 0; x < cols; x++) {
      rotated[x] = []
      for (let y = rows - 1; y >= 0; y--) {
        rotated[x][rows - 1 - y] = piece.shape[y][x]
      }
    }
    return rotated
  }, [])

  const startGame = useCallback(() => {
    boardRef.current = createBoard()
    pieceRef.current = randomPiece()
    setScore(0)
    setLevel(1)
    setLines(0)
    setGameOver(false)
    setIsPlaying(true)
  }, [createBoard, randomPiece])

  useEffect(() => {
    const saved = localStorage.getItem('tetris-high-score')
    if (saved) setHighScore(Number(saved))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE)

      // Grid
      ctx.strokeStyle = '#2a2a3e'
      for (let i = 0; i <= BOARD_WIDTH; i++) {
        ctx.beginPath()
        ctx.moveTo(i * CELL_SIZE, 0)
        ctx.lineTo(i * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE)
        ctx.stroke()
      }
      for (let i = 0; i <= BOARD_HEIGHT; i++) {
        ctx.beginPath()
        ctx.moveTo(0, i * CELL_SIZE)
        ctx.lineTo(BOARD_WIDTH * CELL_SIZE, i * CELL_SIZE)
        ctx.stroke()
      }

      // Board
      boardRef.current.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            ctx.fillStyle = '#4a5568'
            ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
          }
        })
      })

      // Piece
      const piece = pieceRef.current
      if (piece) {
        ctx.fillStyle = piece.color
        piece.shape.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell) {
              ctx.fillRect(
                (piece.x + x) * CELL_SIZE + 1,
                (piece.y + y) * CELL_SIZE + 1,
                CELL_SIZE - 2,
                CELL_SIZE - 2
              )
            }
          })
        })
      }
    }

    const update = () => {
      if (!isPlaying || gameOver) return

      const piece = pieceRef.current
      const board = boardRef.current
      if (!piece) return

      if (isValidMove(piece, board, 0, 1)) {
        piece.y++
      } else {
        boardRef.current = mergePiece(piece, board)
        const { newBoard, cleared } = clearLines(boardRef.current)
        boardRef.current = newBoard

        if (cleared > 0) {
          const points = [0, 100, 300, 500, 800][cleared] * level
          setScore(s => {
            const newScore = s + points
            if (newScore > highScore) {
              setHighScore(newScore)
              localStorage.setItem('tetris-high-score', String(newScore))
            }
            return newScore
          })
          setLines(l => l + cleared)
          setLevel(Math.floor(lines / 10) + 1)
        }

        pieceRef.current = randomPiece()
        if (!isValidMove(pieceRef.current, boardRef.current)) {
          setIsPlaying(false)
          setGameOver(true)
        }
      }

      draw()
      gameLoopRef.current = requestAnimationFrame(update)
    }

    draw()

    if (isPlaying && !gameOver) {
      const interval = setInterval(() => {
        gameLoopRef.current = requestAnimationFrame(update)
      }, Math.max(100, 1000 - (level - 1) * 100))

      return () => {
        clearInterval(interval)
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [isPlaying, gameOver, level, lines, highScore, isValidMove, mergePiece, clearLines, randomPiece])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying || !pieceRef.current) return

      const piece = pieceRef.current
      const board = boardRef.current

      switch (e.key) {
        case 'ArrowLeft':
          if (isValidMove(piece, board, -1, 0)) piece.x--
          break
        case 'ArrowRight':
          if (isValidMove(piece, board, 1, 0)) piece.x++
          break
        case 'ArrowDown':
          if (isValidMove(piece, board, 0, 1)) piece.y++
          break
        case 'ArrowUp':
          const rotated = rotatePiece(piece)
          const oldShape = piece.shape
          piece.shape = rotated
          if (!isValidMove(piece, board)) {
            piece.shape = oldShape
          }
          break
        case ' ':
          while (isValidMove(piece, board, 0, 1)) piece.y++
          break
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isPlaying, isValidMove, rotatePiece])

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-6 text-center">
        <div>
          <div className="text-2xl font-bold text-cyan-500">{score}</div>
          <div className="text-sm text-gray-500">分数</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-500">{level}</div>
          <div className="text-sm text-gray-500">等级</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-500">{highScore}</div>
          <div className="text-sm text-gray-500">最高分</div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH * CELL_SIZE}
        height={BOARD_HEIGHT * CELL_SIZE}
        className="border-2 border-gray-700 rounded-lg"
      />

      <div className="mt-4 flex gap-4">
        {!isPlaying && (
          <button
            onClick={startGame}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            {gameOver ? '再玩一次' : '开始游戏'}
          </button>
        )}
      </div>

      {gameOver && <p className="mt-4 text-red-500 font-semibold">游戏结束！</p>}

      <div className="mt-4 text-gray-500 text-sm space-y-1 text-center">
        <p>← → 移动 | ↑ 旋转 | ↓ 加速 | 空格 直落</p>
      </div>
    </div>
  )
}