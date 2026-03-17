'use client'

import { useState, useCallback, useEffect } from 'react'

const GRID_SIZE = 9
const MINE_COUNT = 10

type Cell = {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}

export default function MinesweeperGame() {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [flagCount, setFlagCount] = useState(0)
  const [time, setTime] = useState(0)
  const [bestTime, setBestTime] = useState<number | null>(null)

  const createEmptyGrid = useCallback((): Cell[][] => {
    return Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    )
  }, [])

  const placeMines = useCallback((g: Cell[][], firstRow: number, firstCol: number): Cell[][] => {
    const newGrid = g.map(row => row.map(cell => ({ ...cell })))
    let minesPlaced = 0

    while (minesPlaced < MINE_COUNT) {
      const row = Math.floor(Math.random() * GRID_SIZE)
      const col = Math.floor(Math.random() * GRID_SIZE)

      // Avoid placing mine on first click or adjacent cells
      if (Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1) continue
      if (newGrid[row][col].isMine) continue

      newGrid[row][col].isMine = true
      minesPlaced++
    }

    // Calculate neighbor mines
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c].isMine) continue
        let count = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
              if (newGrid[nr][nc].isMine) count++
            }
          }
        }
        newGrid[r][c].neighborMines = count
      }
    }

    return newGrid
  }, [])

  const revealCell = useCallback((g: Cell[][], row: number, col: number): Cell[][] => {
    const newGrid = g.map(r => r.map(c => ({ ...c })))

    const reveal = (r: number, c: number) => {
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return
      if (newGrid[r][c].isRevealed || newGrid[r][c].isFlagged) return

      newGrid[r][c].isRevealed = true

      if (newGrid[r][c].neighborMines === 0 && !newGrid[r][c].isMine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(r + dr, c + dc)
          }
        }
      }
    }

    reveal(row, col)
    return newGrid
  }, [])

  const checkWin = useCallback((g: Cell[][]): boolean => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!g[r][c].isMine && !g[r][c].isRevealed) return false
      }
    }
    return true
  }, [])

  const handleCellClick = (row: number, col: number) => {
    if (gameOver || won) return

    let newGrid = grid.map(r => r.map(c => ({ ...c })))

    if (!isPlaying) {
      setIsPlaying(true)
      newGrid = placeMines(createEmptyGrid(), row, col)
    }

    if (newGrid[row][col].isFlagged) return

    if (newGrid[row][col].isMine) {
      // Game over - reveal all mines
      newGrid.forEach(r => r.forEach(c => {
        if (c.isMine) c.isRevealed = true
      }))
      setGrid(newGrid)
      setGameOver(true)
      setIsPlaying(false)
      return
    }

    newGrid = revealCell(newGrid, row, col)
    setGrid(newGrid)

    if (checkWin(newGrid)) {
      setWon(true)
      setIsPlaying(false)
      if (bestTime === null || time < bestTime) {
        setBestTime(time)
        localStorage.setItem('minesweeper-best-time', String(time))
      }
    }
  }

  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    if (gameOver || won || !isPlaying) return
    if (grid[row][col].isRevealed) return

    const newGrid = grid.map(r => r.map(c => ({ ...c })))
    newGrid[row][col].isFlagged = !newGrid[row][col].isFlagged
    setGrid(newGrid)
    setFlagCount(prev => newGrid[row][col].isFlagged ? prev + 1 : prev - 1)
  }

  const startGame = () => {
    setGrid(createEmptyGrid())
    setGameOver(false)
    setWon(false)
    setIsPlaying(false)
    setFlagCount(0)
    setTime(0)
  }

  useEffect(() => {
    startGame()
    const saved = localStorage.getItem('minesweeper-best-time')
    if (saved) setBestTime(Number(saved))
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => setTime(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [isPlaying])

  const getCellColor = (cell: Cell): string => {
    if (cell.isRevealed) {
      if (cell.isMine) return 'bg-red-500'
      const colors: Record<number, string> = {
        0: 'bg-gray-600',
        1: 'text-blue-400',
        2: 'text-green-400',
        3: 'text-red-400',
        4: 'text-purple-400',
        5: 'text-yellow-400',
        6: 'text-cyan-400',
        7: 'text-pink-400',
        8: 'text-white',
      }
      return colors[cell.neighborMines] || 'text-white'
    }
    return 'bg-gray-700 hover:bg-gray-600'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-6 text-center">
        <div>
          <div className="text-2xl font-bold text-red-500">{MINE_COUNT - flagCount}</div>
          <div className="text-sm text-gray-500">剩余雷</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-500">{time}s</div>
          <div className="text-sm text-gray-500">用时</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-500">{bestTime ? `${bestTime}s` : '-'}</div>
          <div className="text-sm text-gray-500">最佳</div>
        </div>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              onContextMenu={(e) => handleRightClick(e, r, c)}
              className={`w-8 h-8 text-sm font-bold rounded flex items-center justify-center transition-colors ${getCellColor(cell)}`}
            >
              {cell.isRevealed
                ? cell.isMine
                  ? '💣'
                  : cell.neighborMines || ''
                : cell.isFlagged
                ? '🚩'
                : ''}
            </button>
          ))
        )}
      </div>

      <button
        onClick={startGame}
        className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        {gameOver || won ? '再来一局' : '重新开始'}
      </button>

      {gameOver && <p className="mt-4 text-red-500 font-semibold">游戏结束！</p>}
      {won && <p className="mt-4 text-green-500 font-semibold">恭喜过关！🎉</p>}

      <p className="mt-4 text-gray-500 text-sm text-center">
        左键揭开 | 右键标记 | 点击开始
      </p>
    </div>
  )
}