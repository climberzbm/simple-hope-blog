'use client'

import { useState, useEffect } from 'react'

export default function BackToTop() {
  const [show, setShow] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      setShow(scrollY > 300)
      setIsAtBottom(scrollY + windowHeight >= documentHeight - 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!show) return null

  return (
    <button
      onClick={scrollToTop}
      className={`fixed right-6 w-12 h-12 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl hover:text-blue-600 dark:hover:text-blue-400 z-50 ${isAtBottom ? 'bottom-24' : 'bottom-6'}`}
      aria-label="回到顶部"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
    </button>
  )
}