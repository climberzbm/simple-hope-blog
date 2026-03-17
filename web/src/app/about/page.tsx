import { getAbout } from '@/lib/request'

export const metadata = {
  title: '关于 - Simple Hope Blog',
}

export default async function AboutPage() {
  let content = ''

  try {
    const res: any = await getAbout()
    content = res?.data?.content || ''
  } catch (error) {
    console.error('Failed to fetch about:', error)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">关于</h1>

      {content ? (
        <article className="prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
        </article>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p>暂无内容</p>
        </div>
      )}
    </div>
  )
}

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}