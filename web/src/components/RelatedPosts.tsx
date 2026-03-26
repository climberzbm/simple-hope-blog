'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { getRelatedPosts } from '@/lib/request'

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  cover?: string
  publishedAt: string
  viewCount: number
  category?: { name: string; slug: string }
  tags?: { name: string; slug: string }[]
}

interface Props {
  slug: string
}

export default function RelatedPosts({ slug }: Props) {
  const [posts, setPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res: any = await getRelatedPosts(slug, 5)
        setPosts(res?.data || [])
      } catch (e) {
        console.error('Failed to fetch related posts:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchRelated()
  }, [slug])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <section className="mt-12">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-blue-500">📖</span>
        相关推荐
      </h3>
      <div className="grid gap-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
          >
            <div className="flex gap-3">
              {post.cover && (
                <div className="flex-shrink-0 w-20 h-14 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={post.cover}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  {post.category && (
                    <span className="text-blue-500">{post.category.name}</span>
                  )}
                  <span>{post.viewCount} 阅读</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}