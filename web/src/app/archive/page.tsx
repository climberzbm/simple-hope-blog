import { getPosts } from '@/lib/request'
import Link from 'next/link'

export const metadata = {
  title: '归档 - 简希博客',
}

// 禁用静态生成
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ArchivePage() {
  const res: any = await getPosts({ page: 1, pageSize: 1000 })
  const posts = res?.data?.list || []

  // 统计
  const totalPosts = posts.length
  const totalViews = posts.reduce((sum: number, p: any) => sum + (p.viewCount || 0), 0)

  // 按年分组
  const grouped: Record<string, any[]> = {}
  posts.forEach((post: any) => {
    const year = new Date(post.publishedAt).getFullYear().toString()
    if (!grouped[year]) grouped[year] = []
    grouped[year].push(post)
  })

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-2">归档</h1>
          <p className="text-gray-500">时光轴上的点滴记录</p>
          
          {/* Stats */}
          <div className="flex gap-8 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalPosts}</div>
              <div className="text-sm text-gray-500">篇文章</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{totalViews.toLocaleString()}</div>
              <div className="text-sm text-gray-500">次阅读</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{years.length}</div>
              <div className="text-sm text-gray-500">个年头</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {years.map((year, yearIndex) => (
          <div key={year} className="relative">
            {/* Year marker */}
            <div className="sticky top-20 z-10 py-2 bg-gray-50 dark:bg-gray-950 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  {year}
                </div>
                <div>
                  <div className="font-semibold">{year}年</div>
                  <div className="text-sm text-gray-500">{grouped[year].length} 篇文章</div>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-8 pb-8 space-y-4">
              {grouped[year]
                .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                .map((post: any, index: number) => {
                  const date = new Date(post.publishedAt)
                  const month = date.getMonth() + 1
                  const day = date.getDate()
                  
                  return (
                    <Link
                      key={post.id}
                      href={`/posts/${post.slug}`}
                      className="group block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Date */}
                        <div className="flex-shrink-0 w-14 text-center">
                          <div className="text-2xl font-bold text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors">
                            {day}
                          </div>
                          <div className="text-xs text-gray-400">{month}月</div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium group-hover:text-blue-600 transition-colors line-clamp-1">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            {post.category && (
                              <span className="text-blue-500">{post.category.name}</span>
                            )}
                            <span>·</span>
                            <span>{post.viewCount} 阅读</span>
                            {post.tags && post.tags.length > 0 && (
                              <>
                                <span>·</span>
                                <span>{post.tags.slice(0, 2).map((t: any) => `#${t.name}`).join(' ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Arrow */}
                        <div className="flex-shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors">
                          →
                        </div>
                      </div>
                    </Link>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}