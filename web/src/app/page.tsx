import { getPosts } from '@/lib/request'
import PostCard from '@/components/PostCard'
import Link from 'next/link'

export default async function Home() {
  const res: any = await getPosts({ page: 1, pageSize: 10 })
  const posts = res?.data?.list || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center py-16 mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple Hope Blog</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
          记录技术学习、分享成长心得
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/posts" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            开始阅读
          </Link>
          <Link href="/about" className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-600 transition-colors">
            关于我
          </Link>
        </div>
      </section>

      {/* Latest Posts */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">最新文章</h2>
          <Link href="/posts" className="text-blue-600 hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}