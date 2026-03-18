import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '简希博客',
    template: '%s - 简希博客',
  },
  description: '个人技术博客，记录学习与成长',
  keywords: ['博客', '技术', '前端', '后端', 'AI'],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        <Header />
        <main className="pt-16 min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}