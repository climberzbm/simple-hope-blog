import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import Link from 'next/link'

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
    <article className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      {post.cover && (
        <Link href={`/posts/${post.slug}`} className="block overflow-hidden">
          <img 
            src={post.cover} 
            alt={post.title} 
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        </Link>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
          {post.isTop && (
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded text-[10px] font-medium">置顶</span>
          )}
          {post.category && (
            <Link href={`/categories/${post.category.slug}`} className="hover:text-blue-600 transition-colors">
              {post.category.name}
            </Link>
          )}
          <span>·</span>
          <time>{formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true, locale: zhCN })}</time>
        </div>

        <Link href={`/posts/${post.slug}`}>
          <h2 className="text-base font-semibold mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {post.excerpt && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex gap-3">
            <span>{post.viewCount} 阅读</span>
            <span>{post.likeCount} 赞</span>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-1.5 overflow-hidden">
              {post.tags.slice(0, 2).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="hover:text-blue-600 transition-colors truncate"
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