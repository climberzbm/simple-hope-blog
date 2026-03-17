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
  {
    id: 'tetris',
    name: '俄罗斯方块',
    description: '经典俄罗斯方块，消除行得分',
    icon: '🟦',
    color: 'bg-cyan-500',
  },
  {
    id: 'minesweeper',
    name: '扫雷',
    description: '找出所有雷，不要踩到炸弹',
    icon: '💣',
    color: 'bg-purple-500',
  },
  {
    id: 'memory',
    name: '记忆翻牌',
    description: '翻开卡片找到配对',
    icon: '🃏',
    color: 'bg-pink-500',
  },
]

export const metadata = {
  title: '游戏 - Simple Hope Blog',
}

export default function GamesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">🎮 游戏吧</h1>
      <p className="text-gray-500 mb-8">放松一下，玩个小游戏吧！</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/games/${game.id}`}
            className="group block p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className={`w-14 h-14 ${game.color} rounded-xl flex items-center justify-center text-2xl mb-3 shadow-sm`}>
              {game.icon}
            </div>
            <h2 className="text-lg font-semibold mb-1 group-hover:text-blue-600 transition-colors">
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