import { Metadata } from 'next'
import FriendLinksClient from './FriendLinksClient'

export const metadata: Metadata = {
  title: '友情链接 - 简希博客',
  description: '友情链接，欢迎交换友链',
}

export default function FriendLinksPage() {
  return <FriendLinksClient />
}