import { Form, Input, Button, Card } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

export default function Login() {
  const onFinish = (values: any) => {
    console.log('Login:', values)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card title="Simple Hope Blog Admin" className="w-96">
        <Form name="login" onFinish={onFinish} autoComplete="off" layout="vertical">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}