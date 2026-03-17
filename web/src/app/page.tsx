import { getPosts } from '@/lib/request'
import PostCard from '@/components/PostCard'
import Link from 'next/link'

export default async function Home() {
  let posts: any[] = []
  try {
    const res: any = await getPosts({ page: 1, pageSize: 6 })
    posts = res?.data?.list || []
  } catch (e) {
    console.error('Failed to fetch posts')
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Simple Hope Blog
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            记录技术学习、分享成长心得
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/posts" className="px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm">
              开始阅读
            </Link>
            <Link href="/about" className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full hover:border-blue-600 hover:text-blue-600 transition-colors">
              关于我
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">最新文章</h2>
            <p className="text-gray-500 text-sm mt-1">记录学习与成长</p>
          </div>
          <Link href="/posts" className="text-blue-600 hover:underline text-sm">
            查看全部 →
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            暂无文章
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="max-w-6xl mx-auto px-4 py-12 border-t border-gray-100 dark:border-gray-800">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/categories" className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all group">
            <div className="text-2xl mb-2">📂</div>
            <h3 className="font-semibold group-hover:text-blue-600 transition-colors">分类</h3>
            <p className="text-sm text-gray-500">按分类浏览文章</p>
          </Link>
          <Link href="/tags" className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all group">
            <div className="text-2xl mb-2">🏷️</div>
            <h3 className="font-semibold group-hover:text-blue-600 transition-colors">标签</h3>
            <p className="text-sm text-gray-500">按标签浏览文章</p>
          </Link>
          <Link href="/archive" className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all group">
            <div className="text-2xl mb-2">📅</div>
            <h3 className="font-semibold group-hover:text-blue-600 transition-colors">归档</h3>
            <p className="text-sm text-gray-500">按时间浏览文章</p>
          </Link>
          <Link href="/games" className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all group">
            <div className="text-2xl mb-2">🎮</div>
            <h3 className="font-semibold group-hover:text-blue-600 transition-colors">游戏</h3>
            <p className="text-sm text-gray-500">放松一下玩游戏</p>
          </Link>
        </div>
      </section>
    </div>
  )
}