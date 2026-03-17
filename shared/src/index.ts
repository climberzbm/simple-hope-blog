// 用户角色
export type UserRole = 'user' | 'admin'

// 用户状态
export type UserStatus = 'active' | 'banned'

// 文章状态
export type PostStatus = 'draft' | 'published'

// 评论状态
export type CommentStatus = 'pending' | 'approved' | 'spam'

// 用户
export interface User {
  id: string
  username: string
  email: string
  nickname?: string
  avatar?: string
  bio?: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
}

// 分类
export interface Category {
  id: string
  name: string
  slug: string
  createdAt: string
}

// 标签
export interface Tag {
  id: string
  name: string
  slug: string
  createdAt: string
}

// 文章
export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  cover?: string
  status: PostStatus
  viewCount: number
  commentCount: number
  isTop: boolean
  allowComment: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
  author: User
  category?: Category
  tags: Tag[]
}

// 评论
export interface Comment {
  id: string
  content: string
  status: CommentStatus
  createdAt: string
  updatedAt: string
  user: User
  parentId?: string
  replies?: Comment[]
}

// 点赞
export interface Like {
  id: string
  userId: string
  postId: string
  createdAt: string
}

// 媒体
export interface Media {
  id: string
  filename: string
  url: string
  size: number
  mimeType: string
  createdAt: string
}

// API 响应
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 分页
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> extends ApiResponse {
  data: {
    list: T[]
    pagination: Pagination
  }
}