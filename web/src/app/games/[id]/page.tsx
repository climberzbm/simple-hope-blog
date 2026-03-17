import { notFound } from 'next/navigation'
import Snake from '@/components/games/Snake'
import Game2048 from '@/components/games/Game2048'
import Breakout from '@/components/games/Breakout'
import Tetris from '@/components/games/Tetris'
import Minesweeper from '@/components/games/Minesweeper'
import Memory from '@/components/games/Memory'
import Link from 'next/link'

const games: Record<string, {
  name: string
  description: string
  component: React.ComponentType
}> = {
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
  tetris: {
    name: '俄罗斯方块',
    description: '经典俄罗斯方块，消除行得分',
    component: Tetris,
  },
  minesweeper: {
    name: '扫雷',
    description: '找出所有雷，不要踩到炸弹',
    component: Minesweeper,
  },
  memory: {
    name: '记忆翻牌',
    description: '翻开卡片找到配对，考验记忆力',
    component: Memory,
  },
}

interface Props {
  params: { id: string }
}

export function generateStaticParams() {
  return Object.keys(games).map((id) => ({ id }))
}

export function generateMetadata({ params }: Props) {
  const game = games[params.id]
  if (!game) return { title: '游戏不存在' }
  return { title: `${game.name} - Simple Hope Blog` }
}

export default function GamePage({ params }: Props) {
  const game = games[params.id]
  
  if (!game) {
    notFound()
  }

  const GameComponent = game.component

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/games" className="text-blue-600 hover:underline text-sm">
          ← 返回游戏列表
        </Link>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1">{game.name}</h1>
        <p className="text-gray-500 text-sm">{game.description}</p>
      </div>

      <div className="flex justify-center overflow-x-auto">
        <GameComponent />
      </div>
    </div>
  )
}