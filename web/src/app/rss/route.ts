import { getPosts } from '@/lib/request'

export const dynamic = 'force-dynamic'

export async function GET() {
  const res: any = await getPosts({ page: 1, pageSize: 50 })
  const posts = res?.data?.list || []

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://climberzbm.cn'

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>简希博客</title>
    <link>${baseUrl}</link>
    <description>个人技术博客，记录学习与成长</description>
    <language>zh-CN</language>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml"/>
    ${posts.map((post: any) => `
    <item>
      <title>${post.title}</title>
      <link>${baseUrl}/posts/${post.slug}</link>
      <description>${post.excerpt || ''}</description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <guid>${baseUrl}/posts/${post.slug}</guid>
    </item>
    `).join('')}
  </channel>
</rss>`.trim()

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}