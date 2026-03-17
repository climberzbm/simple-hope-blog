import { getPosts } from '@/lib/request'
import Link from 'next/link'

export default async function ArchivePage() {
  const res: any = await getPosts({ page: 1, pageSize: 1000 })
  const posts = res?.data?.list || []

  // 按年月分组
  const grouped: Record<string, Record<string, any[]>> = {}

  posts.forEach((post: any) => {
    const date = new Date(post.publishedAt)
    const year = date.getFullYear().toString()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')

    if (!grouped[year]) grouped[year] = {}
    if (!grouped[year][month]) grouped[year][month] = []
    grouped[year][month].push(post)
  })

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">归档</h1>

      {years.map((year) => (
        <section key={year} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{year}年</h2>
          {Object.keys(grouped[year])
            .sort((a, b) => Number(b) - Number(a))
            .map((month) => (
              <div key={month} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-500 mb-2">{month}月</h3>
                <ul className="space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                  {grouped[year][month].map((post: any) => (
                    <li key={post.id} className="flex items-center gap-4">
                      <time className="text-sm text-gray-400 w-16">
                        {new Date(post.publishedAt).toLocaleDateString('zh-CN', { day: '2-digit' })}
                      </time>
                      <Link href={`/posts/${post.slug}`} className="hover:text-blue-600">
                        {post.title}
                      </Link>
                      {post.category && (
                        <span className="text-xs text-gray-400">{post.category.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </section>
      ))}
    </div>
  )
}