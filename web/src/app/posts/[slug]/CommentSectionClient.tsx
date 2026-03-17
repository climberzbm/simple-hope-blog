'use client'

import { useEffect, useState, use } from 'react'
import { useAuthStore } from '@/stores/auth'
import { getComments, getLikeStatus } from '@/lib/request'
import CommentSection from '@/components/CommentSection'
import { HeartIcon } from '@/components/Icons'

interface Props {
  postId: string
  initialComments: any[]
}

export default function CommentSectionClient({ postId, initialComments }: Props) {
  const [comments, setComments] = useState(initialComments)
  const { isAuth } = useAuthStore()

  const refresh = async () => {
    const res: any = await getComments(postId)
    setComments(res?.data?.list || [])
  }

  return <CommentSection postId={postId} comments={comments} onRefresh={refresh} />
}