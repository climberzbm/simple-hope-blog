import api from './api'

// 登录
export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data)

// 获取当前用户
export const getMe = () => api.get('/auth/me')

// 更新资料
export const updateProfile = (data: any) => api.put('/auth/profile', data)

// 修改密码
export const changePassword = (data: { oldPassword: string; newPassword: string }) =>
  api.put('/auth/password', data)

// 文章列表
export const getPosts = (params: any) => api.get('/posts/admin/list', { params })

// 创建文章
export const createPost = (data: any) => api.post('/posts', data)

// 更新文章
export const updatePost = (id: string, data: any) => api.put(`/posts/${id}`, data)

// 删除文章
export const deletePost = (id: string) => api.delete(`/posts/${id}`)

// 分类列表
export const getCategories = () => api.get('/categories')

// 创建分类
export const createCategory = (data: { name: string }) => api.post('/categories', data)

// 更新分类
export const updateCategory = (id: string, data: { name: string }) =>
  api.put(`/categories/${id}`, data)

// 删除分类
export const deleteCategory = (id: string) => api.delete(`/categories/${id}`)

// 标签列表
export const getTags = () => api.get('/tags')

// 创建标签
export const createTag = (data: { name: string }) => api.post('/tags', data)

// 删除标签
export const deleteTag = (id: string) => api.delete(`/tags/${id}`)

// 评论列表
export const getComments = (params: any) => api.get('/comments/admin/list', { params })

// 审核评论
export const auditComment = (id: string, status: string) =>
  api.put(`/comments/${id}/status`, { status })

// 删除评论
export const deleteComment = (id: string) => api.delete(`/comments/${id}`)

// 媒体列表
export const getMedia = (params: any) => api.get('/media', { params })

// 上传图片
export const uploadImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 删除媒体
export const deleteMedia = (id: string) => api.delete(`/media/${id}`)

// 统计数据
export const getStats = () => api.get('/stats/dashboard')

// 获取设置
export const getSettings = () => api.get('/settings')

// 更新设置
export const updateSettings = (data: any) => api.put('/settings', data)

// 获取关于页
export const getAbout = () => api.get('/settings/about')

// 更新关于页
export const updateAbout = (content: string) => api.put('/settings/about', { content })

// 资源列表
export const getResources = (params: any) => api.get('/resources', { params })

// 上传资源
export const uploadResource = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/resources/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 创建文本资源
export const createTextResource = (data: { name: string; content: string; category: string }) =>
  api.post('/resources/text', data)

// 更新资源
export const updateResource = (id: string, data: { name?: string; content?: string }) =>
  api.put(`/resources/${id}`, data)

// 删除资源
export const deleteResource = (id: string) => api.delete(`/resources/${id}`)

// 资源统计
export const getResourceStats = () => api.get('/resources/stats/overview')