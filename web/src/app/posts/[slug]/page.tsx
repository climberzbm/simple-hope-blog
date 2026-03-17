import { getPost, getComments, getLikeStatus } from '@/lib/request'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import TableOfContents from '@/components/TableOfContents'
import CommentSectionClient from './CommentSectionClient'
import LikeButton from './LikeButton'
import '@/styles/markdown.css'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  try {
    const res: any = await getPost(params.slug)
    const post = res?.data
    return {
      title: `${post?.title} - Simple Hope Blog`,
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <article className="grid lg:grid-cols-[1fr_250px] gap-8">
        <div>
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
              {post.category && (
                <Link href={`/categories/${post.category.slug}`} className="hover:text-blue-600">
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
              <div className="flex gap-2">
                {post.tags.map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="markdown-body mb-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />

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
    </div>
  )
}

function renderMarkdown(content: string): string {
  // 简单的 Markdown 渲染（生产环境建议使用 react-markdown）
  return content
    .replace(/^### (.*$)/gm, '<h3 id="$1">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 id="$1">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 id="$1">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/\n/g, '<br>')
}