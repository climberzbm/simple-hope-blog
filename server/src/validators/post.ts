import { z } from 'zod'

// 创建文章参数
export const createPostSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多200个字符'),
  content: z.string().min(1, '内容不能为空'),
  excerpt: z.string().max(500, '摘要最多500个字符').optional(),
  cover: z.string().url('封面必须是有效的URL').optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  isTop: z.boolean().optional(),
  allowComment: z.boolean().optional(),
})

// 更新文章参数
export const updatePostSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题最多200个字符').optional(),
  content: z.string().min(1, '内容不能为空').optional(),
  excerpt: z.string().max(500, '摘要最多500个字符').optional(),
  cover: z.string().url('封面必须是有效的URL').optional(),
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional(),
  isTop: z.boolean().optional(),
  allowComment: z.boolean().optional(),
})

// 文章列表查询
export const postQuerySchema = z.object({
  page: z.string().default('1').transform(Number),
  pageSize: z.string().default('10').transform(Number),
  status: z.enum(['draft', 'published']).optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  keyword: z.string().optional(),
})