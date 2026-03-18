import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Popconfirm,
  Typography,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getPosts, deletePost } from '@/lib/request'

export default function Posts() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async (page = 1) => {
    setLoading(true)
    try {
      const res: any = await getPosts({ page, pageSize: 10 })
      setPosts(res.data.list)
      setPagination({ ...pagination, page, total: res.data.pagination.total })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deletePost(id)
    message.success('删除成功')
    fetchPosts(pagination.page)
  }

  const columns = [
    { title: '标题', dataIndex: 'title', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    { title: '分类', dataIndex: ['category', 'name'], width: 120 },
    { title: '浏览', dataIndex: 'viewCount', width: 80 },
    { title: '评论', dataIndex: 'commentCount', width: 80 },
    { title: '点赞', dataIndex: 'likeCount', width: 80 },
    {
      title: '置顶',
      dataIndex: 'isTop',
      width: 80,
      render: (isTop: boolean) => isTop && <Tag color="blue">置顶</Tag>,
    },
    {
      title: '操作',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/posts/edit/${record.id}`)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography.Title level={4} className="m-0">文章管理</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/posts/create')}>
          新建文章
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={posts}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          total: pagination.total,
          onChange: fetchPosts,
        }}
      />
    </div>
  )
}