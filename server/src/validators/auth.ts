import { z } from 'zod'

// 注册参数
export const registerSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符').max(20, '用户名最多20个字符'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6个字符').max(50, '密码最多50个字符'),
})

// 登录参数 - 支持邮箱或用户名
export const loginSchema = z.object({
  account: z.string().min(1, '请输入邮箱或用户名'),
  password: z.string().min(1, '请输入密码'),
})

// 修改密码参数
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, '请输入旧密码'),
  newPassword: z.string().min(6, '新密码至少6个字符').max(50, '新密码最多50个字符'),
})

// 更新资料参数
export const updateProfileSchema = z.object({
  nickname: z.string().max(50, '昵称最多50个字符').optional(),
  avatar: z.string().url('头像必须是有效的URL').optional(),
  bio: z.string().max(500, '简介最多500个字符').optional(),
})