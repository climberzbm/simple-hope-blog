import { getCategories, getPosts } from '@/lib/request'
import Link from 'next/link'

export default async function CategoriesPage() {
  const [categoriesRes, postsRes]: [any, any] = await Promise.all([
    getCategories(),
    getPosts({ page: 1, pageSize: 100 }),
  ])

  const categories = categoriesRes?.data || []
  const posts = postsRes?.data?.list || []

  // 按分类分组文章
  const groupedPosts = categories.map((cat: any) => ({
    ...cat,
    posts: posts.filter((p: any) => p.category?.id === cat.id),
  }))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">分类</h1>

      <div className="space-y-8">
        {groupedPosts.map((category: any) => (
          <section key={category.id}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>{category.name}</span>
              <span className="text-sm text-gray-400">({category.postCount} 篇)</span>
            </h2>
            <ul className="space-y-2">
              {category.posts.map((post: any) => (
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