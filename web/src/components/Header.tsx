'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { MoonIcon, SunIcon } from './Icons'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, isAuth, logout } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        isScrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold hover:text-blue-600 transition-colors">
          Simple Hope Blog
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">首页</Link>
          <Link href="/categories" className="hover:text-blue-600 transition-colors">分类</Link>
          <Link href="/tags" className="hover:text-blue-600 transition-colors">标签</Link>
          <Link href="/archive" className="hover:text-blue-600 transition-colors">归档</Link>
          <Link href="/games" className="hover:text-blue-600 transition-colors">游戏</Link>
          <Link href="/about" className="hover:text-blue-600 transition-colors">关于</Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isAuth ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="hover:text-blue-600">
                {user?.nickname || user?.username}
              </Link>
              <button onClick={logout} className="text-gray-500 hover:text-red-500">
                退出
              </button>
            </div>
          ) : (
            <Link href="/login" className="hover:text-blue-600 transition-colors">
              登录
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = saved || (prefersDark ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return (
    <button onClick={toggle} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}