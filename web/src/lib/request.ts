import api from './api'

// 认证
export const login = (data: { account: string; password: string }) => api.post('/auth/login', data)
export const register = (data: { username: string; email: string; password: string }) =>
  api.post('/auth/register', data)
export const getMe = () => api.get('/auth/me')
export const updateProfile = (data: any) => api.put('/auth/profile', data)
export const changePassword = (data: any) => api.put('/auth/password', data)

// 文章
export const getPosts = (params?: any) => api.get('/posts', { params })
export const getPost = (slug: string) => api.get(`/posts/${slug}`)
export const getRelatedPosts = (slug: string, limit?: number) =>
  api.get(`/posts/${slug}/related`, { params: { limit } })

// 分类
export const getCategories = () => api.get('/categories')

// 标签
export const getTags = () => api.get('/tags')

// 评论
export const getComments = (postId: string, params?: any) => api.get(`/comments/post/${postId}`, { params })
export const createComment = (data: any) => api.post('/comments', data)
export const deleteComment = (id: string) => api.delete(`/comments/${id}`)

// 点赞
export const toggleLike = (postId: string) => api.post(`/likes/${postId}`)
export const getLikeStatus = (postId: string) => api.get(`/likes/${postId}/status`)

// 设置
export const getSettings = () => api.get('/settings')
export const getAbout = () => api.get('/settings/about')

// 搜索
export const searchPosts = (keyword: string) => api.get('/posts', { params: { keyword } })