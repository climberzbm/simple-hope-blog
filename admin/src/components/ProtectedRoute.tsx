import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuth, user } = useAuthStore()
  const location = useLocation()

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 非管理员无法访问
  if (user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}