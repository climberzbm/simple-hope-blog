import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  username: string
  email: string
  nickname: string
  avatar?: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuth: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuth: false,
      setUser: (user) => set({ user, isAuth: !!user }),
      setToken: (token) => set({ token }),
      login: (user, token) => set({ user, token, isAuth: true }),
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuth: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuth: state.isAuth }),
    }
  )
)