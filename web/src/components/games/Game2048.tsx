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
    const g: Grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
    addRandomTile(g)
    addRandomTile(g)
    return g
  }, [])

  const addRandomTile = (g: Grid) => {
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

  const move = useCallback((g: Grid, dir: Direction): { newGrid: Grid; score: number } => {
    const newGrid = g.map(r => [...r])
    let totalScore = 0

    const processRow = (row: number[]) => {
      const { row: newRow, score } = slideRow(row)
      totalScore += score
      return newRow
    }

    if (dir === 'LEFT') {
      for (let i = 0; i < GRID_SIZE; i++) newGrid[i] = processRow(newGrid[i])
    } else if (dir === 'RIGHT') {
      for (let i = 0; i < GRID_SIZE; i++) newGrid[i] = processRow([...newGrid[i]].reverse()).reverse()
    } else if (dir === 'UP') {
      for (let j = 0; j < GRID_SIZE; j++) {
        const col = newGrid.map(r => r[j])
        const newRow = processRow(col)
        for (let i = 0; i < GRID_SIZE; i++) newGrid[i][j] = newRow[i]
      }
    } else if (dir === 'DOWN') {
      for (let j = 0; j < GRID_SIZE; j++) {
        const col = [...newGrid.map(r => r[j])].reverse()
        const newRow = processRow(col).reverse()
        for (let i = 0; i < GRID_SIZE; i++) newGrid[i][j] = newRow[i]
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

  const handleMove = useCallback((dir: Direction) => {
    if (gameOver || won) return
    const { newGrid, score: moveScore } = move(grid, dir)
    
    if (JSON.stringify(newGrid) !== JSON.stringify(grid)) {
      addRandomTile(newGrid)
      setGrid(newGrid)
      setScore(s => {
        const ns = s + moveScore
        if (ns > bestScore) {
          setBestScore(ns)
          localStorage.setItem('2048-best', String(ns))
        }
        return ns
      })
      if (!canMove(newGrid)) setGameOver(true)
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
      const saved = localStorage.getItem('2048-best')
      if (saved) setBestScore(Number(saved))
      setGrid(initGrid())
    }
  }, [initGrid])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
      }
      if (map[e.key]) {
        e.preventDefault()
        handleMove(map[e.key])
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleMove])

  // 触摸滑动
  useEffect(() => {
    let startX = 0, startY = 0
    const handleTouch = (e: TouchEvent) => {
      if (e.type === 'touchstart') {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
      } else if (e.type === 'touchend') {
        const dx = e.changedTouches[0].clientX - startX
        const dy = e.changedTouches[0].clientY - startY
        if (Math.abs(dx) > Math.abs(dy)) {
          handleMove(dx > 0 ? 'RIGHT' : 'LEFT')
        } else {
          handleMove(dy > 0 ? 'DOWN' : 'UP')
        }
      }
    }
    window.addEventListener('touchstart', handleTouch)
    window.addEventListener('touchend', handleTouch)
    return () => {
      window.removeEventListener('touchstart', handleTouch)
      window.removeEventListener('touchend', handleTouch)
    }
  }, [handleMove])

  const getColor = (v: number): string => {
    const colors: Record<number, string> = {
      0: 'bg-gray-700', 2: 'bg-gray-200 text-gray-800', 4: 'bg-gray-300 text-gray-800',
      8: 'bg-orange-400 text-white', 16: 'bg-orange-500 text-white',
      32: 'bg-orange-600 text-white', 64: 'bg-red-500 text-white',
      128: 'bg-yellow-400 text-white', 256: 'bg-yellow-500 text-white',
      512: 'bg-yellow-600 text-white', 1024: 'bg-yellow-700 text-white', 2048: 'bg-yellow-400 text-white',
    }
    return colors[v] || 'bg-purple-600 text-white'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex gap-6 text-center">
        <div>
          <div className="text-xl font-bold text-orange-500">{score}</div>
          <div className="text-xs text-gray-500">分数</div>
        </div>
        <div>
          <div className="text-xl font-bold text-yellow-500">{bestScore}</div>
          <div className="text-xs text-gray-500">最高</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 p-3 bg-gray-800 rounded-lg">
        {grid.flat().map((v, i) => (
          <div key={i} className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center font-bold rounded ${getColor(v)}`}>
            {v || ''}
          </div>
        ))}
      </div>

      <button onClick={restart} className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg">
        重来
      </button>

      {gameOver && <p className="mt-3 text-red-500">游戏结束!</p>}
      {won && <p className="mt-3 text-yellow-500">恭喜! 🎉</p>}

      <p className="mt-3 text-gray-500 text-xs">方向键或滑动屏幕</p>
    </div>
  )
}