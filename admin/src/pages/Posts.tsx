import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Switch,
  message,
  Popconfirm,
  Typography,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getPosts, createPost, updatePost, deletePost, getCategories, getTags } from '@/lib/request'

const { TextArea } = Input
const { Option } = Select

interface Post {
  id: string
  title: string
  slug: string
  status: string
  viewCount: number
  commentCount: number
  likeCount: number
  isTop: boolean
  createdAt: string
  category?: { id: string; name: string }
  tags?: { id: string; name: string }[]
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 })
  const [form] = Form.useForm()

  useEffect(() => {
    fetchPosts()
    fetchCategories()
    fetchTags()
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

  const fetchCategories = async () => {
    const res: any = await getCategories()
    setCategories(res.data)
  }

  const fetchTags = async () => {
    const res: any = await getTags()
    setTags(res.data)
  }

  const handleCreate = () => {
    setEditingPost(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Post) => {
    setEditingPost(record)
    form.setFieldsValue({
      title: record.title,
      content: '', // 需要单独获取详情
      excerpt: '',
      categoryId: record.category?.id,
      tagIds: record.tags?.map((t) => t.id),
      status: record.status,
      isTop: record.isTop,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    await deletePost(id)
    message.success('删除成功')
    fetchPosts(pagination.page)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    try {
      if (editingPost) {
        await updatePost(editingPost.id, values)
        message.success('更新成功')
      } else {
        await createPost(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchPosts(pagination.page)
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
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
    {
      title: '标签',
      dataIndex: 'tags',
      width: 150,
      render: (tags: any[]) => tags?.map((t) => <Tag key={t.id}>{t.name}</Tag>),
    },
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
      render: (_: any, record: Post) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
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

      <Modal
        title={editingPost ? '编辑文章' : '新建文章'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="请输入文章标题" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <TextArea rows={10} placeholder="支持 Markdown 格式" />
          </Form.Item>
          <Form.Item name="excerpt" label="摘要">
            <TextArea rows={2} placeholder="文章摘要，可选" />
          </Form.Item>
          <Form.Item name="categoryId" label="分类">
            <Select allowClear placeholder="选择分类">
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="tagIds" label="标签">
            <Select mode="multiple" allowClear placeholder="选择标签">
              {tags.map((t) => (
                <Option key={t.id} value={t.id}>{t.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="draft">
            <Select>
              <Option value="draft">草稿</Option>
              <Option value="published">发布</Option>
            </Select>
          </Form.Item>
          <Form.Item name="isTop" label="置顶" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}