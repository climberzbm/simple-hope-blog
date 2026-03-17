import { notFound } from 'next/navigation'
import Snake from '@/components/games/Snake'
import Game2048 from '@/components/games/Game2048'
import Breakout from '@/components/games/Breakout'
import Link from 'next/link'

const games = {
  snake: {
    name: '贪吃蛇',
    description: '控制蛇吃食物变长，不要撞墙或咬到自己',
    component: Snake,
  },
  '2048': {
    name: '2048',
    description: '合并相同数字，目标是达到2048',
    component: Game2048,
  },
  breakout: {
    name: '打砖块',
    description: '控制挡板反弹球消除所有砖块',
    component: Breakout,
  },
}

interface Props {
  params: { id: string }
}

export function generateStaticParams() {
  return Object.keys(games).map((id) => ({ id }))
}

export function generateMetadata({ params }: Props) {
  const game = games[params.id as keyof typeof games]
  if (!game) return { title: '游戏不存在' }
  return { title: `${game.name} - Simple Hope Blog` }
}

export default function GamePage({ params }: Props) {
  const game = games[params.id as keyof typeof games]
  
  if (!game) {
    notFound()
  }

  const GameComponent = game.component

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/games" className="text-blue-600 hover:underline">
          ← 返回游戏列表
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{game.name}</h1>
        <p className="text-gray-500">{game.description}</p>
      </div>

      <div className="flex justify-center">
        <GameComponent />
      </div>
    </div>
  )
}