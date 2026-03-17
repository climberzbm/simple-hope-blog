import { getPosts } from '@/lib/request'
import PostCard from '@/components/PostCard'
import Link from 'next/link'

interface Props {
  searchParams: { page?: string }
}

export default async function PostsPage({ searchParams }: Props) {
  const page = Number(searchParams.page) || 1
  const res: any = await getPosts({ page, pageSize: 10 })
  const posts = res?.data?.list || []
  const pagination = res?.data?.pagination

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">文章</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={`/posts?page=${page - 1}`}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              上一页
            </Link>
          )}
          <span className="px-4 py-2">
            {page} / {pagination.totalPages}
          </span>
          {page < pagination.totalPages && (
            <Link
              href={`/posts?page=${page + 1}`}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              下一页
            </Link>
          )}
        </div>
      )}
    </div>
  )
}