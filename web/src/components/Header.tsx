'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { MoonIcon, SunIcon, MenuIcon, CloseIcon } from './Icons'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuth, logout } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/posts', label: '文章' },
    { href: '/archive', label: '归档' },
    { href: '/games', label: '游戏' },
    { href: '/about', label: '关于' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-800/50' 
        : 'bg-transparent'
    }`}>
      <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow">
            希
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            简希博客
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {isAuth ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                    {user?.nickname?.[0] || user?.username?.[0]?.toUpperCase()}
                  </div>
                  <span>{user?.nickname || user?.username}</span>
                </Link>
                <button onClick={logout} className="px-3 py-1.5 text-sm text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                  退出
                </button>
              </>
            ) : (
              <Link href="/login" className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all">
                登录
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-100 dark:border-gray-800" />
            {isAuth ? (
              <>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg">
                  {user?.nickname || user?.username}
                </Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  退出
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                登录
              </Link>
            )}
          </div>
        </div>
      )}
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
    <button 
      onClick={toggle} 
      className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
      aria-label="切换主题"
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}