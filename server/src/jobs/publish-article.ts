import { prisma } from '../lib/prisma'
import { generateTechArticle, generateLifeArticle } from '../lib/ai'

// 技术文章模板主题
const TECH_TOPICS = [
  { title: 'Vue3 组合式函数最佳实践', category: '前端开发', tags: ['Vue3', 'TypeScript', '最佳实践'] },
  { title: 'React Hooks 性能优化指南', category: '前端开发', tags: ['React', '性能优化', 'Hooks'] },
  { title: 'TypeScript 类型体操实战', category: '前端开发', tags: ['TypeScript', '类型系统'] },
  { title: 'Vite 插件开发入门', category: '前端开发', tags: ['Vite', '工程化'] },
  { title: '前端工程化实践总结', category: '前端开发', tags: ['工程化', '最佳实践'] },
  { title: '小程序性能优化实战', category: '跨端开发', tags: ['小程序', '性能优化'] },
  { title: 'UniApp 跨端开发踩坑', category: '跨端开发', tags: ['UniApp', '跨端'] },
  { title: 'Node.js 微服务架构', category: '后端开发', tags: ['Node.js', '微服务'] },
  { title: 'Prisma ORM 实战技巧', category: '后端开发', tags: ['Prisma', '数据库'] },
  { title: 'AI 前端工具链集成', category: 'AI', tags: ['AI', '工程化'] },
  { title: 'ChatGPT API 调用实践', category: 'AI', tags: ['ChatGPT', 'API'] },
  { title: '大模型 Prompt 工程', category: 'AI', tags: ['AI', 'Prompt'] },
  { title: 'Next.js 14 新特性详解', category: '前端开发', tags: ['Next.js', 'React'] },
  { title: 'Tailwind CSS 实战技巧', category: '前端开发', tags: ['Tailwind', 'CSS'] },
  { title: 'Zustand 状态管理指南', category: '前端开发', tags: ['Zustand', '状态管理'] },
]

const LIFE_TOPICS = [
  { title: '程序员的一天', category: '生活随笔', tags: ['生活', '程序员'] },
  { title: '技术人的成长之路', category: '生活随笔', tags: ['成长', '随笔'] },
  { title: '学习方法的思考', category: '生活随笔', tags: ['学习', '思考'] },
  { title: '远程工作的得与失', category: '生活随笔', tags: ['远程办公', '生活'] },
  { title: '保持代码洁癖', category: '生活随笔', tags: ['编程习惯', '随笔'] },
]

// 主函数：发布文章
export async function publishArticle() {
  console.log('📚 开始发布文章...')

  try {
    // 80% 技术文章，20% 随想
    const isLifeArticle = Math.random() < 0.2
    const topics = isLifeArticle ? LIFE_TOPICS : TECH_TOPICS
    const topic = topics[Math.floor(Math.random() * topics.length)]

    console.log(`📝 生成文章主题: ${topic.title}`)

    // 使用 AI 生成内容
    let content: string
    let excerpt: string

    if (isLifeArticle) {
      const result = await generateLifeArticle(topic.title)
      content = result.content
      excerpt = result.excerpt
    } else {
      const result = await generateTechArticle(topic.title, topic.category, topic.tags)
      content = result.content
      excerpt = result.excerpt
    }

    console.log(`✅ AI 生成完成，文章长度: ${content.length} 字`)

    // 检查分类是否存在
    let category = await prisma.category.findFirst({
      where: { name: topic.category }
    })

    if (!category) {
      category = await prisma.category.create({
        data: { name: topic.category, slug: topic.category.toLowerCase().replace(/\s+/g, '-') }
      })
    }

    // 创建或获取标签
    const tagRecords = await Promise.all(
      topic.tags.map(async (tagName) => {
        let tag = await prisma.tag.findFirst({ where: { name: tagName } })
        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName, slug: tagName.toLowerCase() }
          })
        }
        return tag
      })
    )

    // 生成 slug
    const slug = `${topic.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')}-${Date.now()}`

    // 创建文章
    const post = await prisma.post.create({
      data: {
        title: topic.title,
        slug,
        content,
        excerpt,
        status: 'published',
        publishedAt: new Date(),
        authorId: (await prisma.user.findFirst({ where: { role: 'admin' } }))?.id || '',
        categoryId: category.id,
        tags: {
          create: tagRecords.map(tag => ({ tagId: tag.id }))
        }
      },
      include: { tags: { include: { tag: true } } }
    })

    console.log(`✅ 文章发布成功: ${post.title}`)
    return post
  } catch (error) {
    console.error('❌ 发布文章失败:', error)
    throw error
  }
}

// 执行发布
if (require.main === module) {
  publishArticle()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}