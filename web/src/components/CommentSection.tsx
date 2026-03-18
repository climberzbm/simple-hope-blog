'use client'

import { useState, FormEvent, useMemo } from 'react'
import { useAuthStore } from '@/stores/auth'
import { createComment, deleteComment } from '@/lib/request'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: { id: string; username: string; nickname: string; avatar?: string }
  replies?: Comment[]
}

interface Props {
  postId: string
  comments: Comment[]
  onRefresh: () => void
}

// 随机头像背景色
const AVATAR_COLORS = [
  'bg-red-400',
  'bg-orange-400',
  'bg-amber-400',
  'bg-yellow-400',
  'bg-lime-400',
  'bg-green-400',
  'bg-emerald-400',
  'bg-teal-400',
  'bg-cyan-400',
  'bg-sky-400',
  'bg-blue-400',
  'bg-indigo-400',
  'bg-violet-400',
  'bg-purple-400',
  'bg-fuchsia-400',
  'bg-pink-400',
  'bg-rose-400',
]

function getAvatarColor(username: string): string {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default function CommentSection({ postId, comments, onRefresh }: Props) {
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const { isAuth, user } = useAuthStore()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      await createComment({
        postId,
        content,
        parentId: replyTo?.id,
      })
      setContent('')
      setReplyTo(null)
      onRefresh()
    } catch (error) {
      console.error('Failed to post comment:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条评论？')) return
    try {
      await deleteComment(id)
      onRefresh()
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">评论区</h3>

      {isAuth ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          {replyTo && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              回复 @{replyTo.user.nickname || replyTo.user.username}
              <button type="button" onClick={() => setReplyTo(null)} className="text-blue-600">
                取消
              </button>
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyTo ? `回复 @${replyTo.user.nickname || replyTo.user.username}` : '写下你的评论...'}
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent resize-none focus:outline-none focus:border-blue-500"
            rows={3}
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            发表评论
          </button>
        </form>
      ) : (
        <p className="text-gray-500">
          <a href="/login" className="text-blue-600 hover:underline">登录</a> 后参与评论
        </p>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={user?.id}
            onDelete={handleDelete}
            onReply={setReplyTo}
          />
        ))}
      </div>
    </div>
  )
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
  onReply,
  level = 0,
}: {
  comment: Comment
  currentUserId?: string
  onDelete: (id: string) => void
  onReply: (comment: Comment) => void
  level?: number
}) {
  const avatarColor = useMemo(() => getAvatarColor(comment.user.username), [comment.user.username])

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-100 dark:border-gray-800 pl-4' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-sm text-white font-medium`}>
          {comment.user.nickname?.[0] || comment.user.username[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{comment.user.nickname || comment.user.username}</span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: zhCN })}
            </span>
          </div>
          <p className="mt-1 text-gray-600 dark:text-gray-300">{comment.content}</p>
          <div className="mt-2 flex gap-4 text-sm text-gray-400">
            <button onClick={() => onReply(comment)} className="hover:text-blue-600">
              回复
            </button>
            {currentUserId === comment.user.id && (
              <button onClick={() => onDelete(comment.id)} className="hover:text-red-600">
                删除
              </button>
            )}
          </div>
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          currentUserId={currentUserId}
          onDelete={onDelete}
          onReply={onReply}
          level={level + 1}
        />
      ))}
    </div>
  )
}