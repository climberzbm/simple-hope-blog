'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

const GRID_SIZE = 4

type Grid = number[][]
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>([])
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const initializedRef = useRef(false)

  const initGrid = useCallback((): Grid => {
    const newGrid: Grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
    addRandomTile(newGrid)
    addRandomTile(newGrid)
    return newGrid
  }, [])

  const addRandomTile = (g: Grid): void => {
    const empty: [number, number][] = []
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (g[i][j] === 0) empty.push([i, j])
      }
    }
    if (empty.length === 0) return
    const [row, col] = empty[Math.floor(Math.random() * empty.length)]
    g[row][col] = Math.random() < 0.9 ? 2 : 4
  }

  const clone = (g: Grid): Grid => g.map(row => [...row])

  const slideRow = (row: number[]): { row: number[]; score: number } => {
    const newRow = row.filter(x => x !== 0)
    let score = 0
    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1]) {
        newRow[i] *= 2
        score += newRow[i]
        if (newRow[i] === 2048) setWon(true)
        newRow.splice(i + 1, 1)
      }
    }
    while (newRow.length < GRID_SIZE) newRow.push(0)
    return { row: newRow, score }
  }

  const move = useCallback((g: Grid, direction: Direction): { newGrid: Grid; score: number } => {
    const newGrid = clone(g)
    let totalScore = 0

    if (direction === 'LEFT') {
      for (let i = 0; i < GRID_SIZE; i++) {
        const { row, score } = slideRow(newGrid[i])
        newGrid[i] = row
        totalScore += score
      }
    } else if (direction === 'RIGHT') {
      for (let i = 0; i < GRID_SIZE; i++) {
        const { row, score } = slideRow(newGrid[i].reverse())
        newGrid[i] = row.reverse()
        totalScore += score
      }
    } else if (direction === 'UP') {
      for (let j = 0; j < GRID_SIZE; j++) {
        const col = newGrid.map(row => row[j])
        const { row, score } = slideRow(col)
        for (let i = 0; i < GRID_SIZE; i++) newGrid[i][j] = row[i]
        totalScore += score
      }
    } else if (direction === 'DOWN') {
      for (let j = 0; j < GRID_SIZE; j++) {
        const col = newGrid.map(row => row[j]).reverse()
        const { row, score } = slideRow(col)
        const reversed = row.reverse()
        for (let i = 0; i < GRID_SIZE; i++) newGrid[i][j] = reversed[i]
        totalScore += score
      }
    }

    return { newGrid, score: totalScore }
  }, [])

  const canMove = (g: Grid): boolean => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (g[i][j] === 0) return true
        if (j < GRID_SIZE - 1 && g[i][j] === g[i][j + 1]) return true
        if (i < GRID_SIZE - 1 && g[i][j] === g[i + 1][j]) return true
      }
    }
    return false
  }

  const handleMove = useCallback((direction: Direction) => {
    if (gameOver || won) return
    const { newGrid, score: moveScore } = move(grid, direction)
    
    if (JSON.stringify(newGrid) !== JSON.stringify(grid)) {
      addRandomTile(newGrid)
      setGrid(newGrid)
      setScore(s => {
        const newScore = s + moveScore
        if (newScore > bestScore) {
          setBestScore(newScore)
          localStorage.setItem('2048-best-score', String(newScore))
        }
        return newScore
      })
      
      if (!canMove(newGrid)) {
        setGameOver(true)
      }
    }
  }, [grid, gameOver, won, move, bestScore])

  const restart = () => {
    setGrid(initGrid())
    setScore(0)
    setGameOver(false)
    setWon(false)
  }

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      const saved = localStorage.getItem('2048-best-score')
      if (saved) setBestScore(Number(saved))
      setGrid(initGrid())
    }
  }, [initGrid])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
      }
      if (keyMap[e.key]) {
        e.preventDefault()
        handleMove(keyMap[e.key])
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleMove])

  const getTileColor = (value: number): string => {
    const colors: Record<number, string> = {
      0: 'bg-gray-700',
      2: 'bg-gray-200 text-gray-800',
      4: 'bg-gray-300 text-gray-800',
      8: 'bg-orange-400 text-white',
      16: 'bg-orange-500 text-white',
      32: 'bg-orange-600 text-white',
      64: 'bg-red-500 text-white',
      128: 'bg-yellow-400 text-white',
      256: 'bg-yellow-500 text-white',
      512: 'bg-yellow-600 text-white',
      1024: 'bg-yellow-700 text-white',
      2048: 'bg-yellow-400 text-white',
    }
    return colors[value] || 'bg-purple-600 text-white'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-8 text-center">
        <div>
          <div className="text-2xl font-bold text-orange-500">{score}</div>
          <div className="text-sm text-gray-500">分数</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-500">{bestScore}</div>
          <div className="text-sm text-gray-500">最高分</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 p-4 bg-gray-800 rounded-lg">
        {grid.flat().map((value, i) => (
          <div
            key={i}
            className={`w-16 h-16 flex items-center justify-center font-bold text-xl rounded ${getTileColor(value)}`}
          >
            {value || ''}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-4">
        <button
          onClick={restart}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          重新开始
        </button>
      </div>

      {gameOver && (
        <p className="mt-4 text-red-500 font-semibold">游戏结束！</p>
      )}
      {won && (
        <p className="mt-4 text-yellow-500 font-semibold">恭喜你赢了！🎉</p>
      )}

      <p className="mt-4 text-gray-500 text-sm">
        使用方向键移动方块
      </p>
    </div>
  )
}