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
    { href: '/categories', label: '分类' },
    { href: '/tags', label: '标签' },
    { href: '/archive', label: '归档' },
    { href: '/games', label: '游戏' },
    { href: '/about', label: '关于' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${
      isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold hover:text-blue-600 transition-colors">
          Simple Hope Blog
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-5">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuth ? (
              <>
                <Link href="/profile" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600">
                  {user?.nickname || user?.username}
                </Link>
                <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">
                  退出
                </button>
              </>
            ) : (
              <Link href="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600">
                登录
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-100 dark:border-gray-800" />
            {isAuth ? (
              <>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-600 dark:text-gray-300">
                  {user?.nickname || user?.username}
                </Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block py-2 text-red-500">
                  退出
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-600 dark:text-gray-300">
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
    <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}