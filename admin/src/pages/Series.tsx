import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, message, Popconfirm, Typography, Space, Transfer } from 'antd'
import { PlusOutlined, OrderedListOutlined } from '@ant-design/icons'
import api from '@/lib/api'

interface Series {
  id: string
  name: string
  slug: string
  description?: string
  cover?: string
  postCount: number
  order: number
}

interface Post {
  id: string
  title: string
  key: string
}

export default function SeriesPage() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [postsModalVisible, setPostsModalVisible] = useState(false)
  const [editingSeries, setEditingSeries] = useState<Series | null>(null)
  const [currentSeriesId, setCurrentSeriesId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [availablePosts, setAvailablePosts] = useState<Post[]>([])
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([])
  const [currentPostIds, setCurrentPostIds] = useState<string[]>([])

  useEffect(() => {
    fetchSeries()
  }, [])

  const fetchSeries = async () => {
    setLoading(true)
    try {
      const res: any = await api.get('/series/admin/list')
      setSeries(res.data || [])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingSeries(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Series) => {
    setEditingSeries(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    await api.delete(`/series/admin/${id}`)
    message.success('删除成功')
    fetchSeries()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    try {
      if (editingSeries) {
        await api.put(`/series/admin/${editingSeries.id}`, values)
        message.success('更新成功')
      } else {
        await api.post('/series/admin', values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchSeries()
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败')
    }
  }

  const handleManagePosts = async (record: Series) => {
    setCurrentSeriesId(record.id)
    setCurrentPostIds([]) // 已选中的文章ID
    setSelectedPostIds([])

    try {
      // 获取可选文章
      const res: any = await api.get(`/series/admin/${record.id}/available-posts`)
      const posts = (res.data || []).map((p: any) => ({
        ...p,
        key: p.id,
      }))
      setAvailablePosts(posts)
      setPostsModalVisible(true)
    } catch (error: any) {
      message.error('获取文章列表失败')
    }
  }

  const handleSavePosts = async () => {
    try {
      await api.post(`/series/admin/${currentSeriesId}/posts`, {
        postIds: selectedPostIds,
      })
      message.success('文章设置成功')
      setPostsModalVisible(false)
      fetchSeries()
    } catch (error: any) {
      message.error(error.response?.data?.message || '设置失败')
    }
  }

  const columns = [
    { title: '名称', dataIndex: 'name' },
    { title: 'Slug', dataIndex: 'slug' },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '文章数', dataIndex: 'postCount', width: 80 },
    { title: '排序', dataIndex: 'order', width: 80 },
    {
      title: '操作',
      width: 220,
      render: (_: any, record: Series) => (
        <Space>
          <Button type="link" size="small" icon={<OrderedListOutlined />} onClick={() => handleManagePosts(record)}>
            管理文章
          </Button>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger>
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
        <Typography.Title level={4} className="m-0">
          系列管理
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建系列
        </Button>
      </div>

      <Table columns={columns} dataSource={series} rowKey="id" loading={loading} />

      <Modal
        title={editingSeries ? '编辑系列' : '新建系列'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="系列名称" rules={[{ required: true }]}>
            <Input placeholder="请输入系列名称" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            rules={[
              { required: true },
              { pattern: /^[a-z0-9-]+$/, message: '只能包含小写字母、数字和连字符' },
            ]}
          >
            <Input placeholder="url-friendly-identifier" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} maxLength={500} placeholder="系列简介" />
          </Form.Item>
          <Form.Item name="cover" label="封面图">
            <Input placeholder="https://example.com/cover.jpg" />
          </Form.Item>
          <Form.Item name="order" label="排序权重">
            <Input type="number" placeholder="数字越大越靠前" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="管理系列文章"
        open={postsModalVisible}
        onOk={handleSavePosts}
        onCancel={() => setPostsModalVisible(false)}
        width={700}
      >
        <p className="text-gray-500 mb-4">选择要加入该系列的文章（按选择顺序排序）：</p>
        <Transfer
          dataSource={availablePosts}
          titles={['可选文章', '已选文章']}
          targetKeys={selectedPostIds}
          onChange={setSelectedPostIds}
          render={(item) => item.title}
          listStyle={{ width: 280, height: 400 }}
          showSearch
          filterOption={(input, option) =>
            option.title.toLowerCase().includes(input.toLowerCase())
          }
        />
      </Modal>
    </div>
  )
}