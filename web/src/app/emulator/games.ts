import Link from 'next/link'

// 使用后端代理 ROM URL（解决 CORS）
const games = [
  {
    id: 'geometrix',
    name: 'Geometrix',
    system: 'gb',
    description: '几何益智游戏',
    core: 'gambatte',
    romUrl: '/api/proxy/rom/gb/geometrix',
  },
  {
    id: 'ucity',
    name: 'µCity',
    system: 'gb',
    description: '城市模拟建造游戏',
    core: 'gambatte',
    romUrl: '/api/proxy/rom/gb/ucity',
  },
  {
    id: 'libbet',
    name: 'Libbet Adventures',
    system: 'gb',
    description: '平台跳跃游戏',
    core: 'gambatte',
    romUrl: '/api/proxy/rom/gb/libbet',
  },
  {
    id: 'caru',
    name: 'Car.u',
    system: 'gb',
    description: '赛车游戏',
    core: 'gambatte',
    romUrl: '/api/proxy/rom/gb/caru',
  },
]

export const metadata = {
  title: '复古游戏 - Simple Hope Blog',
}

export { games }