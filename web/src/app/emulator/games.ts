import Link from 'next/link'

// 使用在线公开的 Homebrew 游戏 ROM（开源/免费）
const games = [
  {
    id: 'geometrix',
    name: 'Geometrix',
    system: 'gb',
    description: '几何益智游戏 - 开源免费',
    core: 'gambatte',
    romUrl: 'https://github.com/AntonioND/geometrix/releases/download/v1.0/geometrix.gb',
  },
  {
    id: 'ucity',
    name: 'µCity',
    system: 'gb',
    description: '城市模拟建造游戏 - 开源免费',
    core: 'gambatte',
    romUrl: 'https://github.com/AntonioND/ucity/releases/download/v1.0/ucity.gb',
  },
  {
    id: 'libbet',
    name: 'Libbet Adventures',
    system: 'gb',
    description: '平台跳跃游戏 - 开源免费',
    core: 'gambatte',
    romUrl: 'https://github.com/pinobatch/libbet/releases/download/v0.06/libbet.gb',
  },
  {
    id: 'caru',
    name: 'Car.u',
    system: 'gb',
    description: '赛车游戏 - 开源免费',
    core: 'gambatte',
    romUrl: 'https://github.com/Hacktix/caru/releases/download/v1.0.0/Caru.gb',
  },
]

export const metadata = {
  title: '复古游戏 - Simple Hope Blog',
}

export { games }