import { getPosts } from '@/lib/request'
import PostCard from '@/components/PostCard'

interface Props {
  params: { slug: string }
}

export default async function CategoryPostsPage({ params }: Props) {
  const res: any = await getPosts({ category: params.slug, page: 1, pageSize: 20 })
  const posts = res?.data?.list || []

  const categoryName = posts[0]?.category?.name || params.slug

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">分类：{categoryName}</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-gray-500 py-12">暂无文章</p>
      )}
    </div>
  )
}