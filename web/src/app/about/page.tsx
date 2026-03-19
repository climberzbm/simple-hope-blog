import { getAbout, getSettings } from '@/lib/request'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: '关于 - 简希博客',
}

export default async function AboutPage() {
  const [aboutRes, settingsRes]: [any, any] = await Promise.all([
    getAbout().catch(() => null),
    getSettings().catch(() => null),
  ])

  const aboutContent = aboutRes?.data?.content || ''
  const settings = settingsRes?.data || {}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          {/* Avatar */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl text-white shadow-lg">
            👨‍💻
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            {settings.siteName || '简希博客'}
          </h1>
          <p className="text-gray-500 mb-6">{settings.siteDescription || '记录技术学习、分享成长心得'}</p>
          
          {/* Social Links */}
          <div className="flex justify-center gap-4">
            <Link 
              href="/rss" 
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow-md transition-all text-sm flex items-center gap-2"
            >
              📡 RSS 订阅
            </Link>
            <Link 
              href="/posts" 
              className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700 transition-all text-sm"
            >
              浏览文章
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Intro Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold mb-1">专注领域</h3>
            <p className="text-sm text-gray-500">全栈开发 · 跨端技术 · AI 应用</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
            <div className="text-3xl mb-2">💡</div>
            <h3 className="font-semibold mb-1">写作方向</h3>
            <p className="text-sm text-gray-500">技术实践 · 工程化 · 成长心得</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
            <div className="text-3xl mb-2">🤝</div>
            <h3 className="font-semibold mb-1">交流学习</h3>
            <p className="text-sm text-gray-500">欢迎留言讨论，共同进步</p>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>📱</span> 联系我
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* QR Code */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                {/* 替换为你的二维码图片: /public/qrcode.png */}
                <Image 
                  src="/qrcode.png" 
                  alt="微信二维码" 
                  width={180} 
                  height={180}
                  className="rounded-lg"
                />
              </div>
              <p className="text-center text-sm text-gray-500 mt-3">扫码添加微信</p>
            </div>
            {/* Contact Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <span className="text-xl">📧</span>
                <span>baominzhang0616@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <span className="text-xl">📍</span>
                <span>杭州</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <span className="text-xl">💼</span>
                <span>全栈开发工程师 · 6年经验</span>
              </div>
              <p className="text-sm text-gray-500 pt-2">
                欢迎技术交流、项目合作，期待与你沟通！
              </p>
            </div>
          </div>
        </div>

        {/* About Content */}
        {aboutContent ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>📝</span> 关于我
            </h2>
            <article className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(aboutContent) }} />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>📝</span> 关于我
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>👋 你好，欢迎来到我的博客！</p>
              <p>我是一名<strong>全栈开发工程师</strong>，拥有 6 年开发经验，热爱技术，专注于 Web 开发和跨端技术。</p>
              
              <h3>🛠️ 技术栈</h3>
              <ul>
                <li><strong>前端：</strong>Vue3、React、TypeScript、Tailwind CSS</li>
                <li><strong>跨端：</strong>小程序、UniApp、React Native</li>
                <li><strong>后端：</strong>Node.js、Koa、Prisma、PostgreSQL</li>
                <li><strong>工程化：</strong>Vite、Webpack、CI/CD、Docker</li>
                <li><strong>AI：</strong>大模型应用、Prompt 工程、RAG</li>
              </ul>
              
              <h3>📚 写作主题</h3>
              <p>这个博客主要记录：</p>
              <ul>
                <li>全栈技术学习与实践</li>
                <li>跨端开发经验分享</li>
                <li>工程化最佳实践</li>
                <li>AI 应用探索</li>
                <li>个人成长心得</li>
              </ul>
              
              <h3>🎯 博客特色</h3>
              <p>这是一个用 <strong>Next.js</strong> 构建的现代化博客，支持：</p>
              <ul>
                <li>响应式设计，适配各种设备</li>
                <li>深色模式，保护你的眼睛</li>
                <li>分类标签，方便内容筛选</li>
                <li>RSS 订阅，不错过更新</li>
                <li>休闲游戏，劳逸结合</li>
              </ul>
              
              <p>感谢你的访问，希望这里的内容对你有所帮助！如有问题或建议，欢迎在文章下留言 💬</p>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">探索更多内容</p>
          <div className="flex justify-center gap-4">
            <Link href="/posts" className="text-blue-600 hover:underline">全部文章</Link>
            <span className="text-gray-300">|</span>
            <Link href="/archive" className="text-blue-600 hover:underline">归档</Link>
            <span className="text-gray-300">|</span>
            <Link href="/games" className="text-blue-600 hover:underline">玩游戏</Link>
          </div>
        </div>
      </div>
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
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">$1</code>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p class="my-4">')
    .replace(/\n/g, '<br>')
}