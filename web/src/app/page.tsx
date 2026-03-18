import { getPosts, getTags, getCategories, getSettings } from '@/lib/request'
import PostListItem from '@/components/PostListItem'
import Link from 'next/link'

// 禁用静态生成，每次请求都重新获取数据
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const [postsRes, tagsRes, categoriesRes, settingsRes]: [any, any, any, any] = await Promise.all([
    getPosts({ page: 1, pageSize: 8 }),
    getTags(),
    getCategories(),
    getSettings().catch(() => null),
  ])

  const posts = postsRes?.data?.list || []
  const tags = tagsRes?.data || []
  const categories = categoriesRes?.data || []
  const settings = settingsRes?.data || {}

  // 置顶文章优先排序
  const sortedPosts = posts.sort((a: any, b: any) => {
    if (a.isTop && !b.isTop) return -1
    if (!a.isTop && b.isTop) return 1
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-16 md:py-24">
        {/* 装饰背景 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl text-white shadow-xl shadow-blue-500/25 rotate-3 hover:rotate-0 transition-transform duration-300">
                👨‍💻
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
            
            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                {settings.siteName || '简希博客'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-5 max-w-lg leading-relaxed">
                {settings.siteDescription || '记录技术学习、分享成长心得'}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 rounded-full backdrop-blur-sm">
                  📍 杭州
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 rounded-full backdrop-blur-sm">
                  💻 前端开发
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 rounded-full backdrop-blur-sm">
                  🚀 3年经验
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <Link href="/posts" className="group px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-medium shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5">
                开始阅读
                <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link href="/about" className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all text-sm border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                关于我
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left: Posts List */}
          <div className="flex-1 min-w-0">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">最新文章</h2>
              </div>
              <Link href="/posts" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group">
                查看全部
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Posts */}
            {sortedPosts.length > 0 ? (
              <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-sm backdrop-blur-sm">
                {sortedPosts.map((post: any, index: number) => (
                  <PostListItem key={post.id} post={post} isLast={index === sortedPosts.length - 1} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-5xl mb-4">📝</div>
                <p>暂无文章</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="group text-center p-5 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                <div className="text-3xl font-bold gradient-text">{posts.length}</div>
                <div className="text-sm text-gray-500 mt-1.5">篇文章</div>
              </div>
              <div className="group text-center p-5 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
                <div className="text-3xl font-bold text-purple-600">{categories.length}</div>
                <div className="text-sm text-gray-500 mt-1.5">个分类</div>
              </div>
              <div className="group text-center p-5 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-green-200 dark:hover:border-green-800 transition-colors">
                <div className="text-3xl font-bold text-green-600">{tags.length}</div>
                <div className="text-sm text-gray-500 mt-1.5">个标签</div>
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Categories */}
              <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                    📂
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">分类</h3>
                </div>
                <ul className="space-y-2">
                  {categories.slice(0, 6).map((cat: any) => (
                    <li key={cat.id}>
                      <Link
                        href={`/posts?category=${cat.slug}`}
                        className="flex items-center justify-between text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full font-medium">
                          {cat.postCount || 0}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags */}
              <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                    🏷️
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">标签</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 12).map((tag: any) => (
                    <Link
                      key={tag.id}
                      href={`/posts?tag=${tag.slug}`}
                      className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700/80 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800/80 dark:to-gray-800/80 rounded-2xl border border-blue-100/50 dark:border-gray-700/50 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                    ⚡
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">快捷入口</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/archive" className="flex items-center gap-2 p-3 rounded-xl bg-white/60 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all text-sm shadow-sm hover:shadow">
                    <span>📅</span> 归档
                  </Link>
                  <Link href="/games" className="flex items-center gap-2 p-3 rounded-xl bg-white/60 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all text-sm shadow-sm hover:shadow">
                    <span>🎮</span> 游戏
                  </Link>
                  <Link href="/rss" className="flex items-center gap-2 p-3 rounded-xl bg-white/60 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all text-sm shadow-sm hover:shadow">
                    <span>📡</span> RSS
                  </Link>
                  <Link href="/about" className="flex items-center gap-2 p-3 rounded-xl bg-white/60 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all text-sm shadow-sm hover:shadow">
                    <span>👤</span> 关于
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}