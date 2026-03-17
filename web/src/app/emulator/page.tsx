import Link from 'next/link'

// 公开可用的 Homebrew 游戏（合法ROM）
const games = [
  {
    id: 'flappy',
    name: 'Flappy Bird NES',
    system: 'nes',
    description: '经典 Flappy Bird 的 NES 版本',
    core: 'nestopia',
  },
  {
    id: 'dinothawr',
    name: 'Dinothawr',
    system: 'gba',
    description: '益智解谜游戏',
    core: 'mgba',
  },
  {
    id: 'anguna',
    name: 'Anguna',
    system: 'gba',
    description: '动作冒险游戏',
    core: 'mgba',
  },
]

export const metadata = {
  title: '复古游戏 - Simple Hope Blog',
}

export default function EmulatorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">🕹️ 复古游戏</h1>
      <p className="text-gray-500 mb-8">经典游戏模拟器 - 支持存档</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/emulator/${game.system}/${game.id}`}
            className="group block p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center text-2xl mb-3 shadow-sm">
              {game.system === 'nes' ? '🎮' : '🕹️'}
            </div>
            <h2 className="text-lg font-semibold mb-1 group-hover:text-blue-600 transition-colors">
              {game.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              {game.description}
            </p>
            <span className="text-xs text-gray-400 uppercase">
              {game.system}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-2">📱 操作说明</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• 键盘：方向键移动，Z/X/A/S 为动作键，Enter 开始</li>
          <li>• 移动端：使用屏幕虚拟按键</li>
          <li>• 支持存档/读档（浏览器本地存储）</li>
        </ul>
      </div>
    </div>
  )
}