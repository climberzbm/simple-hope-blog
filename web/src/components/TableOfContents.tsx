'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface Props {
  content: string
}

export default function TableOfContents({ content }: Props) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    // 解析 Markdown 中的标题
    const regex = /^(#{1,3})\s+(.+)$/gm
    const items: TocItem[] = []
    let match

    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2]
      const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      items.push({ id, text, level })
    }

    setHeadings(items)
  }, [content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="sticky top-24 max-h-[calc(100vh-120px)] overflow-auto">
      <h4 className="font-semibold mb-4 text-sm text-gray-500">目录</h4>
      <ul className="space-y-2 text-sm">
        {headings.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
          >
            <a
              href={`#${item.id}`}
              className={`block py-1 border-l-2 pl-3 transition-colors ${
                activeId === item.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}