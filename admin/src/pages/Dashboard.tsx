import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Typography, Tag } from 'antd'
import {
  FileTextOutlined,
  MessageOutlined,
  UserOutlined,
  EyeOutlined,
  LikeOutlined,
} from '@ant-design/icons'
import { getStats } from '@/lib/request'

const { Title } = Typography

interface Stats {
  postCount: number
  publishedCount: number
  commentCount: number
  userCount: number
  totalViews: number
  totalLikes: number
  recentPosts: any[]
  recentComments: any[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res: any = await getStats()
      setStats(res.data)
    } finally {
      setLoading(false)
    }
  }

  const postColumns = [
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '浏览', dataIndex: 'viewCount', width: 80 },
    { title: '点赞', dataIndex: 'likeCount', width: 80 },
  ]

  const commentColumns = [
    { title: '用户', dataIndex: ['user', 'nickname'], width: 100 },
    { title: '内容', dataIndex: 'content', ellipsis: true },
    { title: '文章', dataIndex: ['post', 'title'], ellipsis: true, width: 150 },
  ]

  return (
    <div>
      <Title level={4} className="mb-6">仪表盘</Title>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="文章总数"
              value={stats?.postCount || 0}
              prefix={<FileTextOutlined />}
              suffix={<span className="text-sm text-gray-400 ml-2">已发布 {stats?.publishedCount || 0}</span>}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card loading={loading}>
            <Statistic title="评论数" value={stats?.commentCount || 0} prefix={<MessageOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card loading={loading}>
            <Statistic title="总浏览量" value={stats?.totalViews || 0} prefix={<EyeOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6}>
          <Card loading={loading}>
            <Statistic title="总点赞数" value={stats?.totalLikes || 0} prefix={<LikeOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最近文章" loading={loading}>
            <Table
              columns={postColumns}
              dataSource={stats?.recentPosts || []}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近评论" loading={loading}>
            <Table
              columns={commentColumns}
              dataSource={stats?.recentComments || []}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}