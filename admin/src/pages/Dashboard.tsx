import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Typography, Segmented } from 'antd'
import {
  FileTextOutlined,
  MessageOutlined,
  EyeOutlined,
  LikeOutlined,
  RiseOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { getStats } from '@/lib/request'
import api from '@/lib/api'

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

interface ViewData {
  date: string
  count: number
}

interface Overview {
  today: number
  week: number
  month: number
  total: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [viewData, setViewData] = useState<ViewData[]>([])
  const [hotPosts, setHotPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState<number>(7)

  useEffect(() => {
    fetchStats()
    fetchOverview()
    fetchViews(days)
    fetchHotPosts()
  }, [])

  useEffect(() => {
    fetchViews(days)
  }, [days])

  const fetchStats = async () => {
    try {
      const res: any = await getStats()
      setStats(res.data)
    } finally {
      setLoading(false)
    }
  }

  const fetchOverview = async () => {
    try {
      const res: any = await api.get('/stats/overview')
      setOverview(res.data)
    } catch (e) {
      console.error('Failed to fetch overview:', e)
    }
  }

  const fetchViews = async (d: number) => {
    try {
      const res: any = await api.get('/stats/views', { params: { days: d } })
      setViewData(res.data || [])
    } catch (e) {
      console.error('Failed to fetch views:', e)
    }
  }

  const fetchHotPosts = async () => {
    try {
      const res: any = await api.get('/stats/hot-posts', { params: { limit: 10 } })
      setHotPosts(res.data || [])
    } catch (e) {
      console.error('Failed to fetch hot posts:', e)
    }
  }

  // 计算柱状图最大值
  const maxCount = Math.max(...viewData.map((d) => d.count), 1)

  const postColumns = [
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '浏览', dataIndex: 'viewCount', width: 80 },
    { title: '点赞', dataIndex: 'likeCount', width: 80 },
  ]

  const hotPostColumns = [
    { title: '排名', width: 60, render: (_: any, __: any, index: number) => index + 1 },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '浏览', dataIndex: 'viewCount', width: 80, sorter: (a: any, b: any) => a.viewCount - b.viewCount },
    { title: '点赞', dataIndex: 'likeCount', width: 80 },
    { title: '评论', dataIndex: 'commentCount', width: 80 },
  ]

  const commentColumns = [
    { title: '用户', dataIndex: ['user', 'nickname'], width: 100 },
    { title: '内容', dataIndex: 'content', ellipsis: true },
    { title: '文章', dataIndex: ['post', 'title'], ellipsis: true, width: 150 },
  ]

  return (
    <div>
      <Title level={4} className="mb-6">仪表盘</Title>

      {/* 概览统计 */}
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

      {/* 访问概览 */}
      <Card title="访问概览" className="mb-6">
        <Row gutter={[24, 16]}>
          <Col xs={12} sm={6}>
            <Statistic
              title={<span className="flex items-center gap-2"><CalendarOutlined /> 今日访问</span>}
              value={overview?.today || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title={<span className="flex items-center gap-2"><RiseOutlined /> 本周访问</span>}
              value={overview?.week || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title={<span className="flex items-center gap-2"><CalendarOutlined /> 本月访问</span>}
              value={overview?.month || 0}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title={<span className="flex items-center gap-2"><EyeOutlined /> 累计访问</span>}
              value={overview?.total || 0}
            />
          </Col>
        </Row>
      </Card>

      {/* 访问趋势 */}
      <Card
        title="访问趋势"
        className="mb-6"
        extra={
          <Segmented
            value={days}
            onChange={(value) => setDays(value as number)}
            options={[
              { label: '7天', value: 7 },
              { label: '14天', value: 14 },
              { label: '30天', value: 30 },
            ]}
          />
        }
      >
        <div className="flex items-end gap-2 h-48 px-2">
          {viewData.map((item) => (
            <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-600 hover:to-blue-500"
                style={{
                  height: `${Math.max((item.count / maxCount) * 160, 4)}px`,
                }}
                title={`${item.date}: ${item.count} 次访问`}
              />
              <span className="text-xs text-gray-400 transform -rotate-45 origin-left">
                {item.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
        {viewData.length > 0 && (
          <div className="text-center text-gray-500 text-sm mt-4">
            近 {days} 天共 {viewData.reduce((sum, d) => sum + d.count, 0)} 次访问
          </div>
        )}
      </Card>

      {/* 热门文章 */}
      <Card title="热门文章 TOP 10" className="mb-6">
        <Table
          columns={hotPostColumns}
          dataSource={hotPosts}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* 最近文章和评论 */}
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