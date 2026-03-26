'use client'

import { useEffect, useState } from 'react'

interface Props {
  text: string
  speed?: number // 每个字符的延迟（毫秒）
  className?: string
  cursorChar?: string
  onComplete?: () => void
}

export default function TypewriterText({
  text,
  speed = 80,
  className = '',
  cursorChar = '|',
  onComplete,
}: Props) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayText('')
    setIsComplete(false)
    
    let index = 0
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
        setIsComplete(true)
        onComplete?.()
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, onComplete])

  return (
    <span className={className}>
      {displayText}
      <span
        className={`inline-block ${isComplete ? 'animate-pulse' : ''}`}
        style={{ marginLeft: '2px' }}
      >
        {cursorChar}
      </span>
    </span>
  )
}