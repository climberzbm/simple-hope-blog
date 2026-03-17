'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { games } from '../../games'

const CORE_MAP: Record<string, string> = {
  nes: 'nestopia',
  snes: 'snes9x',
  gba: 'mgba',
  gb: 'gambatte',
  n64: 'mupen64plus',
}

export default function EmulatorGamePage() {
  const params = useParams()
  const system = params.system as string
  const gameId = params.gameId as string
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const initializedRef = useRef(false)

  const game = games.find(g => g.id === gameId)

  useEffect(() => {
    if (initializedRef.current) return
    if (!containerRef.current) return
    if (!game) {
      setError('游戏不存在')
      setLoading(false)
      return
    }
    
    initializedRef.current = true

    const core = CORE_MAP[system] || 'gambatte'
    
    // 清理
    const oldEmulator = document.getElementById('emulator-container')
    if (oldEmulator) oldEmulator.remove()
    
    document.querySelectorAll('script[src*="emulatorjs"], script[src*="loader"]').forEach(s => s.remove())
    
    const win = window as any
    delete win.EJS_player
    delete win.EJS_core
    delete win.EJS_gameUrl
    delete win.EJS_color
    delete win.EJS_startOnLoaded
    delete win.EJS_pathtodata
    delete win.EJS_language

    // 创建容器
    const wrapper = document.createElement('div')
    wrapper.id = 'emulator-container'
    wrapper.style.width = '100%'
    wrapper.style.maxWidth = '640px'
    wrapper.style.margin = '0 auto'
    wrapper.style.minHeight = '400px'
    wrapper.style.backgroundColor = '#1a1a2e'
    wrapper.style.borderRadius = '8px'
    containerRef.current.appendChild(wrapper)

    // 配置 EmulatorJS - 使用在线 ROM
    win.EJS_player = '#emulator-container'
    win.EJS_core = core
    win.EJS_gameUrl = game.romUrl  // 使用在线 URL
    win.EJS_language = 'zh-CN'
    win.EJS_color = '#3b82f6'
    win.EJS_startOnLoaded = true
    win.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/'
    
    // 加载脚本
    const script = document.createElement('script')
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js'
    script.async = true
    
    script.onload = () => setLoading(false)
    script.onerror = () => {
      setError('模拟器加载失败')
      setLoading(false)
    }

    document.body.appendChild(script)
  }, [system, gameId, game])

  if (!game) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/emulator" className="text-blue-600 hover:underline text-sm">← 返回</Link>
        <div className="text-center py-12">
          <p className="text-red-500">游戏不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/emulator" className="text-blue-600 hover:underline text-sm">← 返回游戏列表</Link>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">{game.name}</h1>
        <p className="text-gray-500 text-sm">{game.description}</p>
      </div>

      {error ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <>
          {loading && (
            <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">加载游戏中...</p>
            </div>
          )}
          
          <div ref={containerRef} className="mb-6"></div>

          {/* 移动端虚拟按键 */}
          <div className="md:hidden">
            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
              {['↑', '↓', '←', '→', 'A', 'B', '▶'].map((btn, i) => (
                <button
                  key={i}
                  className="p-3 bg-gray-700 text-white rounded-lg font-medium active:bg-gray-600 text-sm select-none"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            <h3 className="font-semibold mb-2">🎮 控制</h3>
            <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
              <span>方向键：移动</span>
              <span>Z：A 键 / X：B 键</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}