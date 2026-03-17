'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { getMe, updateProfile, changePassword } from '@/lib/request'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, isAuth, logout, setUser } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isAuth) {
      router.push('/login')
    } else if (user) {
      setNickname(user.nickname || '')
    }
  }, [isAuth, user, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res: any = await updateProfile({ nickname, bio })
      setUser(res.data)
      setMessage('资料更新成功')
    } catch (err: any) {
      setMessage(err.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setMessage('新密码至少6位')
      return
    }
    setLoading(true)
    try {
      await changePassword({ oldPassword, newPassword })
      setMessage('密码修改成功')
      setOldPassword('')
      setNewPassword('')
    } catch (err: any) {
      setMessage(err.message || '修改失败')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuth || !user) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">个人中心</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">基本资料</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">用户名</label>
            <input
              type="text"
              value={user.username}
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">邮箱</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">简介</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            保存资料
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">修改密码</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">旧密码</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            修改密码
          </button>
        </form>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      <button
        onClick={() => { logout(); router.push('/'); }}
        className="px-4 py-2 text-red-600 hover:text-red-700"
      >
        退出登录
      </button>
    </div>
  )
}