'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

// EmulatorJS 配置
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
    { label: 'Start', key: 'Enter' },
    { label: 'Select', key: 'ShiftRight' },
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
    { label: 'Start', key: 'Enter' },
    { label: 'Select', key: 'ShiftRight' },
  ],
}

export default function EmulatorGamePage() {
  const params = useParams()
  const system = params.system as string
  const gameId = params.gameId as string
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!containerRef.current) return

    const core = CORE_MAP[system] || 'nestopia'
    
    // 创建 EmulatorJS 容器
    const wrapper = document.createElement('div')
    wrapper.id = 'game'
    wrapper.style.width = '100%'
    wrapper.style.maxWidth = '640px'
    wrapper.style.margin = '0 auto'
    containerRef.current.appendChild(wrapper)

    // 加载 EmulatorJS
    const script = document.createElement('script')
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js'
    script.async = true
    
    script.onload = () => {
      // 配置模拟器
      ;(window as any).EJS_player = '#game'
      ;(window as any).EJS_core = core
      ;(window as any).EJS_gameUrl = `/emulator/${system}/${gameId}.rom`
      ;(window as any).EJS_language = 'zh-CN'
      ;(window as any).EJS_color = '#3b82f6'
      ;(window as any).EJS_startOnLoaded = true
      ;(window as any).EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/'
      
      setLoading(false)
    }
    
    script.onerror = () => {
      setError('模拟器加载失败')
      setLoading(false)
    }

    document.body.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      const existingScript = document.querySelector('script[src*="emulatorjs"]')
      if (existingScript) existingScript.remove()
    }
  }, [system, gameId])

  const buttons = BUTTON_LAYOUT[system] || BUTTON_LAYOUT.nes

  const handleTouchButton = (key: string) => {
    const keyCode = key.replace('Key', '').charCodeAt(0)
    const keyMap: Record<string, number> = {
      ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39,
      Enter: 13, ShiftRight: 16, KeyZ: 90, KeyX: 88, KeyA: 65, KeyS: 83,
    }
    const code = keyMap[key] || keyCode
    
    window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: code, key: key }))
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { keyCode: code, key: key }))
    }, 50)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/emulator" className="text-blue-600 hover:underline text-sm">
          ← 返回游戏列表
        </Link>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-gray-500 text-sm">
            请确保 ROM 文件存在于 /public/emulator/{system}/{gameId}.rom
          </p>
        </div>
      ) : (
        <>
          {loading && (
            <div className="text-center py-12">
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
                  onClick={() => handleTouchButton(btn.key)}
                  className="p-3 bg-gray-700 text-white rounded-lg font-medium active:bg-gray-600 text-sm"
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <p className="text-center text-gray-500 text-xs mt-4">
              点击按钮或使用键盘操作
            </p>
          </div>
        </>
      )}
    </div>
  )
}