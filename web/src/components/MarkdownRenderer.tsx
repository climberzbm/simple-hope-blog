'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import '@/styles/github-dark.css'

interface Props {
  content: string
}

export default function MarkdownRenderer({ content }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 去掉第一个 h1 标题（页面顶部已显示）
  const processedContent = content.replace(/^#\s+.+\n/, '')

  // 添加复制按钮
  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.copy-btn')) return

      const btn = document.createElement('button')
      btn.className = 'copy-btn'
      btn.type = 'button'
      btn.innerHTML = '复制'
      btn.onclick = async () => {
        const code = pre.querySelector('code')?.textContent || ''
        await navigator.clipboard.writeText(code)
        btn.innerHTML = '已复制'
        btn.classList.add('copied')
        setTimeout(() => {
          btn.innerHTML = '复制'
          btn.classList.remove('copied')
        }, 2000)
      }

      pre.appendChild(btn)
    })
  }, [processedContent])

  return (
    <div ref={containerRef} className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}