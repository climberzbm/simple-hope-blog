'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { login, register } from '@/lib/request'
import { useAuthStore } from '@/stores/auth'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login: setAuth } = useAuthStore()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      let res: any
      if (isLogin) {
        const account = formData.get('account') as string
        const password = formData.get('password') as string
        res = await login({ account, password })
      } else {
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const username = formData.get('username') as string
        res = await register({ email, password, username })
      }
      setAuth(res.data.user, res.data.token)
      router.push('/')
    } catch (err: any) {
      setError(err.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">
          {isLogin ? '登录' : '注册'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isLogin ? (
            <div>
              <label className="block text-sm font-medium mb-1">邮箱 / 用户名</label>
              <input
                type="text"
                name="account"
                required
                placeholder="请输入邮箱或用户名"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:border-blue-500"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">用户名</label>
                <input
                  type="text"
                  name="username"
                  required
                  minLength={3}
                  maxLength={20}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">邮箱</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">密码</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:border-blue-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-500">
          {isLogin ? '没有账号？' : '已有账号？'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline ml-1"
          >
            {isLogin ? '去注册' : '去登录'}
          </button>
        </p>
      </div>
    </div>
  )
}