import { PrismaClient } from '@prisma/client'
import { Feed } from 'feed'
import { prisma } from '../lib/prisma'

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
]

const LIFE_TOPICS = [
  { title: '程序员的一天', category: '生活随笔', tags: ['生活', '程序员'] },
  { title: '技术人的成长之路', category: '生活随笔', tags: ['成长', '随笔'] },
  { title: '学习方法的思考', category: '生活随笔', tags: ['学习', '思考'] },
]

// 生成文章内容
function generateContent(topic: typeof TECH_TOPICS[0]): string {
  const intros = [
    `今天我们来聊聊 ${topic.title}，这是前端开发中非常重要的话题。`,
    `${topic.title} 是每个开发者都应该掌握的技能。`,
    `在实践中，${topic.title} 能帮助我们写出更好的代码。`,
  ]
  
  const content = `
# ${topic.title}

${intros[Math.floor(Math.random() * intros.length)]}

## 背景

在实际项目开发中，我们经常会遇到各种挑战。本文将分享一些实用的经验和技巧。

## 核心要点

### 1. 基础概念

首先，我们需要理解核心概念。这是掌握任何技术的基础。

### 2. 实践技巧

以下是一些实践中的技巧：

- 保持代码简洁
- 注重可维护性
- 编写测试用例

### 3. 常见问题

在实践中可能遇到的问题：

\`\`\`typescript
// 示例代码
const example = () => {
  console.log('Hello, World!')
}
\`\`\`

## 总结

${topic.title} 需要在实践中不断摸索。希望本文对你有所帮助。

---

*本文由系统自动生成，如有问题请联系管理员。*
`

  return content.trim()
}

// 生成文章摘要
function generateExcerpt(topic: typeof TECH_TOPICS[0]): string {
  const excerpts = [
    `分享关于 ${topic.title} 的实践经验。`,
    `本文介绍 ${topic.title} 的核心概念和实践技巧。`,
    `深入探讨 ${topic.title}，帮助你提升开发技能。`,
  ]
  return excerpts[Math.floor(Math.random() * excerpts.length)]
}

// 主函数：发布文章
export async function publishArticle() {
  console.log('📚 开始发布文章...')

  try {
    // 80% 技术文章，20% 随想
    const isLifeArticle = Math.random() < 0.2
    const topics = isLifeArticle ? LIFE_TOPICS : TECH_TOPICS
    const topic = topics[Math.floor(Math.random() * topics.length)]

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

    // 生成文章内容
    const content = generateContent(topic)
    const excerpt = generateExcerpt(topic)

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