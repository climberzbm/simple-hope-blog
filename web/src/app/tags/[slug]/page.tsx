import { getPosts } from '@/lib/request'
import PostCard from '@/components/PostCard'

interface Props {
  params: { slug: string }
}

export default async function TagPostsPage({ params }: Props) {
  const res: any = await getPosts({ tag: params.slug, page: 1, pageSize: 20 })
  const posts = res?.data?.list || []

  // 找到标签名
  let tagName = params.slug
  if (posts.length > 0 && posts[0].tags) {
    const tag = posts[0].tags.find((t: any) => t.slug === params.slug)
    if (tag) tagName = tag.name
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">标签：#{tagName}</h1>

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