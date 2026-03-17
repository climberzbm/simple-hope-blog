import { z } from 'zod'

// 发表评论
export const createCommentSchema = z.object({
  content: z.string().min(1, '评论内容不能为空').max(1000, '评论最多1000个字符'),
  parentId: z.string().optional(),
})

// 评论查询
export const commentQuerySchema = z.object({
  page: z.string().default('1').transform(Number),
  pageSize: z.string().default('10').transform(Number),
  status: z.enum(['pending', 'approved', 'spam']).optional(),
})