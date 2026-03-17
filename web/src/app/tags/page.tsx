import { getTags, getPosts } from '@/lib/request'
import Link from 'next/link'

export default async function TagsPage() {
  const [tagsRes, postsRes]: [any, any] = await Promise.all([
    getTags(),
    getPosts({ page: 1, pageSize: 100 }),
  ])

  const tags = tagsRes?.data || []
  const posts = postsRes?.data?.list || []

  // 按标签分组文章
  const groupedPosts = tags.map((tag: any) => ({
    ...tag,
    posts: posts.filter((p: any) => p.tags?.some((t: any) => t.id === tag.id)),
  }))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">标签</h1>

      {/* 标签云 */}
      <div className="flex flex-wrap gap-2 mb-12">
        {tags.map((tag: any) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors"
          >
            #{tag.name} ({tag.postCount})
          </Link>
        ))}
      </div>

      {/* 文章列表 */}
      <div className="space-y-8">
        {groupedPosts
          .filter((t) => t.posts.length > 0)
          .map((tag: any) => (
            <section key={tag.id}>
              <h2 className="text-xl font-semibold mb-4">#{tag.name}</h2>
              <ul className="space-y-2">
                {tag.posts.map((post: any) => (
                  <li key={post.id} className="flex items-center gap-4">
                    <time className="text-sm text-gray-400 w-24">
                      {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
                    </time>
                    <Link href={`/posts/${post.slug}`} className="hover:text-blue-600">
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </div>
    </div>
  )
}