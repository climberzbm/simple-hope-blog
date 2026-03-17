import Link from 'next/link'

const games = [
  {
    id: 'snake',
    name: '贪吃蛇',
    description: '经典贪吃蛇游戏，控制蛇吃食物变长',
    icon: '🐍',
    color: 'bg-green-500',
  },
  {
    id: '2048',
    name: '2048',
    description: '数字合成游戏，合并相同数字达到2048',
    icon: '🔢',
    color: 'bg-orange-500',
  },
  {
    id: 'breakout',
    name: '打砖块',
    description: '控制挡板反弹球消除砖块',
    icon: '🧱',
    color: 'bg-blue-500',
  },
]

export const metadata = {
  title: '游戏 - Simple Hope Blog',
}

export default function GamesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🎮 游戏吧</h1>
      <p className="text-gray-500 mb-8">放松一下，玩个小游戏吧！</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/games/${game.id}`}
            className="group block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-16 h-16 ${game.color} rounded-xl flex items-center justify-center text-3xl mb-4`}>
              {game.icon}
            </div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
              {game.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {game.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}