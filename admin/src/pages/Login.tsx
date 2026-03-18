import { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { login } from '@/lib/request'
import { useAuthStore } from '@/stores/auth'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login: setAuth } = useAuthStore()

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      const res: any = await login(values)
      
      // 检查是否是管理员
      if (res.data.user.role !== 'admin') {
        message.error('无权限访问管理后台')
        setLoading(false)
        return
      }
      
      setAuth(res.data.user, res.data.token)
      message.success('登录成功')
      navigate('/')
    } catch (error: any) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card title="Simple Hope Blog Admin" className="w-96">
        <Form name="login" onFinish={onFinish} autoComplete="off" layout="vertical">
          <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }]}>
            <Input prefix={<UserOutlined />} placeholder="邮箱" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center text-gray-400 text-sm">
          仅限管理员访问
        </div>
      </Card>
    </div>
  )
}