'use client'

import { useState, useEffect, useCallback } from 'react'

const PAIRS = 8
const ICONS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎸']

type Card = {
  id: number
  icon: string
  isFlipped: boolean
  isMatched: boolean
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [isLocked, setIsLocked] = useState(false)

  const shuffleCards = useCallback((): Card[] => {
    const icons = [...ICONS.slice(0, PAIRS), ...ICONS.slice(0, PAIRS)]
    return icons
      .sort(() => Math.random() - 0.5)
      .map((icon, id) => ({
        id,
        icon,
        isFlipped: false,
        isMatched: false,
      }))
  }, [])

  const startGame = useCallback(() => {
    setCards(shuffleCards())
    setFlippedCards([])
    setMoves(0)
    setMatches(0)
    setGameOver(false)
    setIsLocked(false)
  }, [shuffleCards])

  useEffect(() => {
    startGame()
    const saved = localStorage.getItem('memory-best-score')
    if (saved) setBestScore(Number(saved))
  }, [startGame])

  const handleCardClick = (id: number) => {
    if (isLocked) return

    const card = cards.find(c => c.id === id)
    if (!card || card.isFlipped || card.isMatched) return

    const newCards = cards.map(c =>
      c.id === id ? { ...c, isFlipped: true } : c
    )
    setCards(newCards)

    const newFlipped = [...flippedCards, id]
    setFlippedCards(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      setIsLocked(true)

      const [first, second] = newFlipped
      const firstCard = newCards.find(c => c.id === first)!
      const secondCard = newCards.find(c => c.id === second)!

      if (firstCard.icon === secondCard.icon) {
        // Match!
        const matchedCards = newCards.map(c =>
          c.id === first || c.id === second
            ? { ...c, isMatched: true }
            : c
        )
        setCards(matchedCards)
        setMatches(m => m + 1)
        setFlippedCards([])
        setIsLocked(false)

        if (matches + 1 === PAIRS) {
          setGameOver(true)
          if (bestScore === null || moves + 1 < bestScore) {
            setBestScore(moves + 1)
            localStorage.setItem('memory-best-score', String(moves + 1))
          }
        }
      } else {
        // No match
        setTimeout(() => {
          const resetCards = newCards.map(c =>
            c.id === first || c.id === second
              ? { ...c, isFlipped: false }
              : c
          )
          setCards(resetCards)
          setFlippedCards([])
          setIsLocked(false)
        }, 1000)
      }
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-6 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-500">{moves}</div>
          <div className="text-sm text-gray-500">步数</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-500">{matches}/{PAIRS}</div>
          <div className="text-sm text-gray-500">配对</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-500">{bestScore || '-'}</div>
          <div className="text-sm text-gray-500">最佳</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={isLocked}
            className={`w-16 h-16 text-2xl rounded-lg transition-all duration-300 transform ${
              card.isFlipped || card.isMatched
                ? 'bg-white rotate-0'
                : 'bg-blue-600 rotate-180'
            } ${card.isMatched ? 'opacity-50' : ''}`}
          >
            {(card.isFlipped || card.isMatched) ? card.icon : ''}
          </button>
        ))}
      </div>

      <button
        onClick={startGame}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        重新开始
      </button>

      {gameOver && (
        <p className="mt-4 text-green-500 font-semibold">
          恭喜完成！用了 {moves} 步 🎉
        </p>
      )}

      <p className="mt-4 text-gray-500 text-sm">
        翻开卡片找到配对
      </p>
    </div>
  )
}