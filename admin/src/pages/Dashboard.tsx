import { Layout, Typography } from 'antd'

const { Content } = Layout

export default function Dashboard() {
  return (
    <Layout className="min-h-screen">
      <Content className="p-8">
        <Typography.Title level={2}>仪表盘</Typography.Title>
        <Typography.Text>正在构建中...</Typography.Text>
      </Content>
    </Layout>
  )
}