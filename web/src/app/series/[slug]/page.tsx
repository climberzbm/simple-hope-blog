import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import api from '@/lib/api'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  try {
    const res: any = await api.get(`/series/public/${params.slug}`)
    const series = res?.data
    return {
      title: `${series?.name} - 简希博客`,
      description: series?.description,
    }
  } catch {
    return { title: '系列不存在' }
  }
}

export default async function SeriesDetailPage({ params }: Props) {
  let series: any

  try {
    const res: any = await api.get(`/series/public/${params.slug}`)
    series = res?.data
  } catch {
    notFound()
  }

  if (!series) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/series" className="text-purple-600 hover:text-purple-700 text-sm">
              ← 返回系列列表
            </Link>
          </div>

          <div className="flex gap-6">
            {/* Cover */}
            <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center overflow-hidden shadow-lg">
              {series.cover ? (
                <img src={series.cover} alt={series.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">📖</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {series.name}
              </h1>
              {series.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {series.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span>📝</span> {series.posts?.length || 0} 篇文章
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {series.posts?.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">📝</div>
            <p>该系列暂无文章</p>
          </div>
        ) : (
          <div className="space-y-4">
            {series.posts?.map((post: any, index: number) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="group flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all"
              >
                {/* Order */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {post.title}
                  </h2>
                  <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                    {post.category && (
                      <span className="text-purple-500">{post.category.name}</span>
                    )}
                    <span>{post.viewCount} 阅读</span>
                    {post.publishedAt && (
                      <span>{format(new Date(post.publishedAt), 'yyyy-MM-dd', { locale: zhCN })}</span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 text-gray-400 group-hover:text-purple-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}