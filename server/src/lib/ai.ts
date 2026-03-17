import axios from 'axios'

const AI_BASE_URL = process.env.AI_BASE_URL || 'https://coding.dashscope.aliyuncs.com/v1'
const AI_API_KEY = process.env.AI_API_KEY || 'sk-sp-bf4797c30fb246898548832bc5bc56ab'
const AI_MODEL = process.env.AI_MODEL || 'glm-5'

interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * 调用 AI 生成内容
 */
export async function generateWithAI(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const messages: AIMessage[] = []
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  
  messages.push({ role: 'user', content: prompt })

  try {
    const response = await axios.post<AIResponse>(
      `${AI_BASE_URL}/chat/completions`,
      {
        model: AI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        timeout: 120000,
      }
    )

    return response.data.choices[0]?.message?.content || ''
  } catch (error: any) {
    console.error('AI API 调用失败:', error.response?.data || error.message)
    throw new Error('AI 生成失败: ' + (error.response?.data?.error?.message || error.message))
  }
}

/**
 * 生成技术文章
 */
export async function generateTechArticle(title: string, category: string, tags: string[]): Promise<{
  content: string
  excerpt: string
}> {
  const systemPrompt = `你是一位资深的技术博客作者，擅长写深入浅出的技术文章。
你的文章风格：
1. 结构清晰，有明确的小节划分
2. 代码示例丰富，注释详细
3. 有实际应用场景和踩坑经验
4. 语言简洁但深入，不啰嗦
5. 使用 Markdown 格式输出

输出要求：
- 标题使用 ## 和 ###
- 代码块使用 \`\`\`language 格式
- 列表使用 - 或数字
- 最后有一个简洁的总结`

  const prompt = `请写一篇关于 "${title}" 的技术博客文章。

分类：${category}
标签：${tags.join(', ')}

要求：
1. 文章长度 1500-2500 字
2. 包含 2-3 个代码示例
3. 有背景介绍、核心概念、实践技巧、常见问题等小节
4. 文章末尾生成一段 50-100 字的摘要，用 "---EXCERPT---" 分隔

现在开始写作：`

  const result = await generateWithAI(prompt, systemPrompt)
  
  // 分离正文和摘要
  let content = result
  let excerpt = ''
  
  if (result.includes('---EXCERPT---')) {
    const parts = result.split('---EXCERPT---')
    content = parts[0].trim()
    excerpt = parts[1]?.trim() || ''
  }
  
  // 如果没有生成摘要，取第一段
  if (!excerpt) {
    const firstParagraph = content.split('\n\n').find(p => p.length > 50 && !p.startsWith('#'))
    excerpt = firstParagraph?.slice(0, 150) + '...' || `分享关于 ${title} 的实践经验。`
  }

  return { content, excerpt }
}

/**
 * 生成生活随笔文章
 */
export async function generateLifeArticle(title: string): Promise<{
  content: string
  excerpt: string
}> {
  const systemPrompt = `你是一位热爱生活的程序员博主，擅长写有温度的生活随笔。
你的文章风格：
1. 真实、接地气，不矫情
2. 有程序员视角的独特思考
3. 语言轻松幽默，但言之有物
4. 使用 Markdown 格式输出

输出要求：
- 标题使用 ## 和 ###
- 列表使用 - 或数字
- 最后有一个简洁的总结`

  const prompt = `请写一篇题为 "${title}" 的生活随笔。

要求：
1. 文章长度 800-1500 字
2. 有个人经历和感悟
3. 真实不做作
4. 文章末尾生成一段 50-80 字的摘要，用 "---EXCERPT---" 分隔

现在开始写作：`

  const result = await generateWithAI(prompt, systemPrompt)
  
  let content = result
  let excerpt = ''
  
  if (result.includes('---EXCERPT---')) {
    const parts = result.split('---EXCERPT---')
    content = parts[0].trim()
    excerpt = parts[1]?.trim() || ''
  }
  
  if (!excerpt) {
    const firstParagraph = content.split('\n\n').find(p => p.length > 30 && !p.startsWith('#'))
    excerpt = firstParagraph?.slice(0, 120) + '...' || title
  }

  return { content, excerpt }
}

/**
 * 生成评论回复
 */
export async function generateCommentReply(
  postTitle: string,
  postContent: string,
  commentContent: string
): Promise<string> {
  const systemPrompt = `你是博客作者，需要回复读者的评论。
回复风格：
1. 友好、真诚
2. 针对评论内容，不要泛泛而谈
3. 简洁，50-100 字左右
4. 可以适当感谢或鼓励`

  const prompt = `文章标题：${postTitle}

文章摘要：${postContent.slice(0, 500)}...

读者评论：${commentContent}

请生成一条真诚的回复：`

  return generateWithAI(prompt, systemPrompt)
}