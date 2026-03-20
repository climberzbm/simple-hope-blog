import { getPost, getComments } from '@/lib/request'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import TableOfContents from '@/components/TableOfContents'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import CommentSectionClient from './CommentSectionClient'
import LikeButton from './LikeButton'
import BackToTop from '@/components/BackToTop'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  try {
    const res: any = await getPost(params.slug)
    const post = res?.data
    return {
      title: `${post?.title} - 简希博客`,
      description: post?.excerpt,
    }
  } catch {
    return { title: '文章不存在' }
  }
}

export default async function PostPage({ params }: Props) {
  let post: any
  let comments: any[] = []

  try {
    const res: any = await getPost(params.slug)
    post = res?.data
    const commentsRes: any = await getComments(post.id)
    comments = commentsRes?.data?.list || []
  } catch {
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 overflow-x-hidden">
      <article className="grid lg:grid-cols-[1fr_250px] gap-8">
        <div className="min-w-0 overflow-hidden">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
              {post.category && (
                <Link href={`/posts?category=${post.category.slug}`} className="hover:text-blue-600">
                  {post.category.name}
                </Link>
              )}
              <span>·</span>
              <time>{format(new Date(post.publishedAt), 'PPP', { locale: zhCN })}</time>
              <span>·</span>
              <span>{post.viewCount} 阅读</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/posts?tag=${tag.slug}`}
                    className="px-3 py-1 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="mb-8">
            <MarkdownRenderer content={post.content} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-700">
            <LikeButton postId={post.id} initialCount={post.likeCount} />
            <span className="text-gray-500">{post.commentCount} 评论</span>
          </div>

          {/* Comments */}
          <section className="mt-8">
            <CommentSectionClient postId={post.id} initialComments={comments} />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <TableOfContents content={post.content} />
        </aside>
      </article>

      {/* Back to Top */}
      <BackToTop />
    </div>
  )
}