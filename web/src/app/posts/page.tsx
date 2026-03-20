'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getPosts, getCategories, getTags } from '@/lib/request'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  viewCount: number
  likeCount: number
  isTop?: boolean
  publishedAt: string
  category?: { id: string; name: string; slug: string }
  tags?: { id: string; name: string; slug: string }[]
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

function PostsContent() {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // 从 URL 参数初始化筛选
  useEffect(() => {
    const categorySlug = searchParams.get('category')
    const tagSlug = searchParams.get('tag')
    if (categorySlug) setSelectedCategory(categorySlug)
    if (tagSlug) setSelectedTag(tagSlug)
  }, [searchParams])

  useEffect(() => {
    Promise.all([getCategories(), getTags()]).then(([catRes, tagRes]) => {
      setCategories(catRes?.data || [])
      setTags(tagRes?.data || [])
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    const params: any = { page, pageSize: 20 }
    if (selectedCategory) params.category = selectedCategory
    if (selectedTag) params.tag = selectedTag

    getPosts(params)
      .then((res: any) => {
        setPosts(res?.data?.list || [])
        setPagination(res?.data?.pagination)
      })
      .finally(() => setLoading(false))
  }, [page, selectedCategory, selectedTag])

  const clearFilters = () => {
    setSelectedCategory(null)
    setSelectedTag(null)
    setPage(1)
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-2">文章</h1>
          <p className="text-gray-500">探索技术，记录成长</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filters - Categories */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">分类：</span>
          <button
            onClick={() => { setSelectedCategory(null); setPage(1) }}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            全部
          </button>
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.slug); setSelectedTag(null); setPage(1) }}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filters - Tags */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">标签：</span>
          <button
            onClick={() => { setSelectedTag(null); setPage(1) }}
            className={`px-2.5 py-0.5 text-sm rounded-full transition-colors ${
              !selectedTag
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            全部
          </button>
          {tags.slice(0, 12).map((tag) => (
            <button
              key={tag.id}
              onClick={() => { setSelectedTag(tag.slug); setSelectedCategory(null); setPage(1) }}
              className={`px-2.5 py-0.5 text-sm rounded-full transition-colors ${
                selectedTag === tag.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              #{tag.name}
            </button>
          ))}
        </div>

        {/* Active Filter */}
        {(selectedCategory || selectedTag) && (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <span className="text-gray-500">当前：</span>
            {selectedCategory && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded">
                {categories.find(c => c.slug === selectedCategory)?.name}
              </span>
            )}
            {selectedTag && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded">
                #{tags.find(t => t.slug === selectedTag)?.name}
              </span>
            )}
            <button onClick={clearFilters} className="text-gray-400 hover:text-red-500">✕</button>
          </div>
        )}

        {/* Posts List */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            {posts.map((post) => (
              <a
                key={post.id}
                href={`/posts/${post.slug}`}
                className="group flex items-start gap-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-2 px-2 rounded transition-colors"
              >
                {/* 日期 */}
                <div className="flex-shrink-0 w-20 text-sm text-gray-400">
                  {formatDate(post.publishedAt)}
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.isTop && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded font-medium">
                        置顶
                      </span>
                    )}
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {post.category && (
                      <span className="text-blue-500">{post.category.name}</span>
                    )}
                    <span>{post.viewCount} 阅读</span>
                    {post.tags && post.tags.length > 0 && (
                      <span className="truncate">
                        {post.tags.slice(0, 2).map(t => `#${t.name}`).join(' ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* 箭头 */}
                <div className="flex-shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors">
                  →
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 bg-white dark:bg-gray-800 rounded-xl">
            <div className="text-4xl mb-4">📭</div>
            <p>暂无文章</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ← 上一页
            </button>
            <span className="text-sm text-gray-500">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              下一页 →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PostsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-x-hidden">
        <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-2">文章</h1>
            <p className="text-gray-500">探索技术，记录成长</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <PostsContent />
    </Suspense>
  )
}