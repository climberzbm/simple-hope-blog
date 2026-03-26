'use client'

import { useState, useEffect } from 'react'

interface Props {
  title: string
  enableTypewriter?: boolean
  speed?: number
}

export default function PostTitle({ title, enableTypewriter = false, speed = 60 }: Props) {
  const [displayText, setDisplayText] = useState(enableTypewriter ? '' : title)
  const [isComplete, setIsComplete] = useState(!enableTypewriter)

  useEffect(() => {
    if (!enableTypewriter) {
      setDisplayText(title)
      setIsComplete(true)
      return
    }

    setDisplayText('')
    setIsComplete(false)
    
    let index = 0
    const timer = setInterval(() => {
      if (index < title.length) {
        setDisplayText(title.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
        setIsComplete(true)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [title, enableTypewriter, speed])

  if (!enableTypewriter) {
    return <>{title}</>
  }

  return (
    <>
      {displayText}
      {!isComplete && (
        <span className="inline-block ml-0.5 animate-pulse text-blue-500">|</span>
      )}
    </>
  )
}