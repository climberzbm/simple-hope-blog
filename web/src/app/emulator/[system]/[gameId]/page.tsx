'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const CORE_MAP: Record<string, string> = {
  nes: 'nestopia',
  snes: 'snes9x',
  gba: 'mgba',
  gb: 'gambatte',
  n64: 'mupen64plus',
}

const BUTTON_LAYOUT: Record<string, { label: string; key: string }[]> = {
  nes: [
    { label: '↑', key: 'ArrowUp' },
    { label: '↓', key: 'ArrowDown' },
    { label: '←', key: 'ArrowLeft' },
    { label: '→', key: 'ArrowRight' },
    { label: 'A', key: 'KeyZ' },
    { label: 'B', key: 'KeyX' },
    { label: '▶', key: 'Enter' },
  ],
  gba: [
    { label: '↑', key: 'ArrowUp' },
    { label: '↓', key: 'ArrowDown' },
    { label: '←', key: 'ArrowLeft' },
    { label: '→', key: 'ArrowRight' },
    { label: 'A', key: 'KeyZ' },
    { label: 'B', key: 'KeyX' },
    { label: 'L', key: 'KeyA' },
    { label: 'R', key: 'KeyS' },
    { label: '▶', key: 'Enter' },
  ],
}

export default function EmulatorGamePage() {
  const params = useParams()
  const system = params.system as string
  const gameId = params.gameId as string
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    if (!containerRef.current) return
    initializedRef.current = true

    const core = CORE_MAP[system] || 'nestopia'
    
    // 清理旧的模拟器实例
    const oldEmulator = document.getElementById('emulator-container')
    if (oldEmulator) oldEmulator.remove()
    
    // 清理旧脚本
    document.querySelectorAll('script[src*="emulatorjs"], script[src*="loader"]').forEach(s => s.remove())
    delete (window as any).EJS_player
    delete (window as any).EJS_core
    delete (window as any).EJS_gameUrl
    delete (window as any).EJS_color
    delete (window as any).EJS_startOnLoaded
    delete (window as any).EJS_pathtodata
    delete (window as any).EJS_language

    // 创建容器
    const wrapper = document.createElement('div')
    wrapper.id = 'emulator-container'
    wrapper.style.width = '100%'
    wrapper.style.maxWidth = '640px'
    wrapper.style.margin = '0 auto'
    wrapper.style.minHeight = '360px'
    wrapper.style.backgroundColor = '#1a1a2e'
    wrapper.style.borderRadius = '8px'
    containerRef.current.appendChild(wrapper)

    // 配置 EmulatorJS
    ;(window as any).EJS_player = '#emulator-container'
    ;(window as any).EJS_core = core
    ;(window as any).EJS_gameUrl = `/emulator/${system}/${gameId}.rom`
    ;(window as any).EJS_language = 'zh-CN'
    ;(window as any).EJS_color = '#3b82f6'
    ;(window as any).EJS_startOnLoaded = true
    ;(window as any).EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/'
    
    // 加载脚本
    const script = document.createElement('script')
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js'
    script.async = true
    
    script.onload = () => {
      setLoading(false)
    }
    
    script.onerror = () => {
      setError('模拟器加载失败，请刷新页面重试')
      setLoading(false)
    }

    document.body.appendChild(script)

    return () => {
      // 不在这里清理，避免切换页面时破坏模拟器
    }
  }, [system, gameId])

  const buttons = BUTTON_LAYOUT[system] || BUTTON_LAYOUT.nes

  const handleTouchButton = (key: string) => {
    const keyMap: Record<string, number> = {
      ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39,
      Enter: 13, KeyZ: 90, KeyX: 88, KeyA: 65, KeyS: 83,
    }
    const code = keyMap[key] || 0
    
    window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: code }))
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { keyCode: code }))
    }, 100)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/emulator" className="text-blue-600 hover:underline text-sm">
          ← 返回游戏列表
        </Link>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">{system.toUpperCase()} 模拟器</h1>
        <p className="text-gray-500 text-sm">游戏 ID: {gameId}</p>
      </div>

      {error ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-gray-500 text-sm">
            请确保 ROM 文件存在：<br/>
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
              /public/emulator/{system}/{gameId}.rom
            </code>
          </p>
        </div>
      ) : (
        <>
          {loading && (
            <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">加载模拟器中...</p>
            </div>
          )}
          
          <div ref={containerRef} className="mb-6"></div>

          {/* 移动端虚拟按键 */}
          <div className="md:hidden">
            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
              {buttons.map((btn) => (
                <button
                  key={btn.key}
                  onTouchStart={() => handleTouchButton(btn.key)}
                  className="p-3 bg-gray-700 text-white rounded-lg font-medium active:bg-gray-600 text-sm select-none"
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <p className="text-center text-gray-500 text-xs mt-4">
              点击按钮控制
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            <h3 className="font-semibold mb-2">🎮 键盘控制</h3>
            <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
              <span>方向键：移动</span>
              <span>Z：A 键</span>
              <span>X：B 键</span>
              <span>Enter：开始</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}