import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  cover?: string
  viewCount: number
  commentCount: number
  likeCount: number
  isTop: boolean
  publishedAt: string
  category?: { id: string; name: string; slug: string }
  tags?: { id: string; name: string; slug: string }[]
  author?: { id: string; username: string; nickname: string }
}

interface Props {
  post: Post
}

export default function PostCard({ post }: Props) {
  return (
    <article className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {post.cover && (
        <Link href={`/posts/${post.slug}`}>
          <img src={post.cover} alt={post.title} className="w-full h-48 object-cover" />
        </Link>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
          {post.isTop && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">置顶</span>
          )}
          {post.category && (
            <Link href={`/categories/${post.category.slug}`} className="hover:text-blue-600">
              {post.category.name}
            </Link>
          )}
          <span>·</span>
          <time>{formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true, locale: zhCN })}</time>
        </div>

        <Link href={`/posts/${post.slug}`}>
          <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {post.excerpt && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex gap-4">
            <span>{post.viewCount} 阅读</span>
            <span>{post.likeCount} 点赞</span>
            <span>{post.commentCount} 评论</span>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2">
              {post.tags.slice(0, 2).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="hover:text-blue-600"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}