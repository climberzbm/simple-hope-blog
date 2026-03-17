import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 创建管理员
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@climberzbm.cn' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@climberzbm.cn',
      password: adminPassword,
      nickname: '管理员',
      role: 'admin',
      status: 'active',
    },
  })
  console.log('✅ Admin created:', admin.username)

  // 创建测试用户
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      username: 'testuser',
      email: 'user@example.com',
      password: userPassword,
      nickname: '测试用户',
      role: 'user',
      status: 'active',
    },
  })
  console.log('✅ Test user created:', user.username)

  // 创建分类
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'frontend' },
      update: {},
      create: { name: '前端开发', slug: 'frontend' },
    }),
    prisma.category.upsert({
      where: { slug: 'backend' },
      update: {},
      create: { name: '后端开发', slug: 'backend' },
    }),
    prisma.category.upsert({
      where: { slug: 'ai' },
      update: {},
      create: { name: 'AI 人工智能', slug: 'ai' },
    }),
    prisma.category.upsert({
      where: { slug: 'life' },
      update: {},
      create: { name: '生活随笔', slug: 'life' },
    }),
  ])
  console.log('✅ Categories created:', categories.length)

  // 创建标签
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'vue' },
      update: {},
      create: { name: 'Vue', slug: 'vue' },
    }),
    prisma.tag.upsert({
      where: { slug: 'react' },
      update: {},
      create: { name: 'React', slug: 'react' },
    }),
    prisma.tag.upsert({
      where: { slug: 'typescript' },
      update: {},
      create: { name: 'TypeScript', slug: 'typescript' },
    }),
    prisma.tag.upsert({
      where: { slug: 'nodejs' },
      update: {},
      create: { name: 'Node.js', slug: 'nodejs' },
    }),
    prisma.tag.upsert({
      where: { slug: 'chatgpt' },
      update: {},
      create: { name: 'ChatGPT', slug: 'chatgpt' },
    }),
  ])
  console.log('✅ Tags created:', tags.length)

  // 创建示例文章
  const post = await prisma.post.upsert({
    where: { slug: 'welcome-to-my-blog' },
    update: {},
    create: {
      title: '欢迎来到我的博客',
      slug: 'welcome-to-my-blog',
      content: `# 欢迎来到我的博客

这是一个技术博客，用于记录学习和成长。

## 关于我

我是一名前端开发工程师，热爱技术，热爱生活。

## 博客内容

- 前端开发技巧
- 后端开发经验
- AI 报时与实践
- 生活感悟

感谢您的访问！

\`\`\`typescript
console.log('Hello, World!')
\`\`\`
`,
      excerpt: '欢迎来到我的个人技术博客，这里将记录我的学习和成长。',
      status: 'published',
      authorId: admin.id,
      categoryId: categories[0].id,
      publishedAt: new Date(),
    },
  })
  console.log('✅ Sample post created:', post.title)

  // 为文章添加标签
  await prisma.postTag.createMany({
    data: [
      { postId: post.id, tagId: tags[0].id },
      { postId: post.id, tagId: tags[2].id },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Post tags created')

  // 创建站点设置
  await prisma.setting.upsert({
    where: { key: 'site_title' },
    update: {},
    create: { key: 'site_title', value: 'Simple Hope Blog' },
  })
  await prisma.setting.upsert({
    where: { key: 'site_description' },
    update: {},
    create: { key: 'site_description', value: '个人技术博客，记录学习与成长' },
  })
  await prisma.setting.upsert({
    where: { key: 'site_author' },
    update: {},
    create: { key: 'site_author', value: 'climberzbm' },
  })
  console.log('✅ Site settings created')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })