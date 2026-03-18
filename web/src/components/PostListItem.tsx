interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  viewCount: number
  likeCount: number
  commentCount: number
  isTop?: boolean
  publishedAt: string
  category?: { id: string; name: string; slug: string }
  tags?: { id: string; name: string; slug: string }[]
}

interface Props {
  post: Post
  isLast?: boolean
}

export default function PostListItem({ post, isLast }: Props) {
  const formatDate = (date: string) => {
    const d = new Date(date)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${month}/${day}`
  }

  return (
    <a
      href={`/posts/${post.slug}`}
      className={`group flex items-start gap-5 py-5 px-6 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200 ${isLast ? '' : 'border-b border-gray-100 dark:border-gray-700/50'}`}
    >
      {/* 日期 */}
      <div className="flex-shrink-0 w-14 text-center pt-1">
        <div className="text-sm font-medium text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors">
          {formatDate(post.publishedAt)}
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-2">
          {post.isTop && (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md shadow-sm">
              置顶
            </span>
          )}
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {post.title}
          </h3>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {post.category && (
            <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
              {post.category.name}
            </span>
          )}
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {post.viewCount}
          </span>
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-1.5">
              {post.tags.slice(0, 2).map(tag => (
                <span key={tag.id} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700/80 text-gray-500 dark:text-gray-400 rounded-md">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 箭头 */}
      <div className="flex-shrink-0 self-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all group-hover:translate-x-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  )
}