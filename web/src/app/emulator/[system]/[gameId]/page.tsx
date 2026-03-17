'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { games } from '../../games'

export default function EmulatorGamePage() {
  const params = useParams()
  const system = params.system as string
  const gameId = params.gameId as string

  const game = games.find(g => g.id === gameId)

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

  // 使用独立 HTML 页面 + URL 参数
  const emulatorUrl = `/emulator.html?system=${game.system}&rom=${encodeURIComponent(game.romUrl)}`

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/emulator" className="text-blue-600 hover:underline text-sm">← 返回游戏列表</Link>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">{game.name}</h1>
        <p className="text-gray-500 text-sm">{game.description}</p>
      </div>

      {/* 使用独立 HTML 隔离模拟器 */}
      <div className="relative w-full rounded-lg overflow-hidden border-2 border-gray-700" style={{ minHeight: '400px' }}>
        <iframe
          src={emulatorUrl}
          className="w-full"
          style={{ height: '70vh', minHeight: '400px' }}
          allow="fullscreen"
          allowFullScreen
        />
      </div>

      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
        <h3 className="font-semibold mb-2">🎮 控制</h3>
        <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
          <span>方向键：移动</span>
          <span>Z：A 键 / X：B 键</span>
          <span>Enter：开始</span>
          <span>Shift：选择</span>
        </div>
      </div>
    </div>
  )
}