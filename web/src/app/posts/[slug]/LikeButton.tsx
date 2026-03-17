'use client'

import { useState, useEffect } from 'react'
import { toggleLike, getLikeStatus } from '@/lib/request'
import { useAuthStore } from '@/stores/auth'
import { HeartIcon } from '@/components/Icons'

interface Props {
  postId: string
  initialCount: number
}

export default function LikeButton({ postId, initialCount }: Props) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const { isAuth } = useAuthStore()

  useEffect(() => {
    if (isAuth) {
      getLikeStatus(postId).then((res: any) => {
        setLiked(res?.data?.liked || false)
      })
    }
  }, [postId, isAuth])

  const handleLike = async () => {
    if (!isAuth) {
      window.location.href = '/login'
      return
    }
    if (loading) return

    setLoading(true)
    try {
      const res: any = await toggleLike(postId)
      setLiked(res?.data?.liked)
      setCount((prev) => (res?.data?.liked ? prev + 1 : prev - 1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        liked ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      <HeartIcon className="w-5 h-5" filled={liked} />
      <span>{count} 点赞</span>
    </button>
  )
}