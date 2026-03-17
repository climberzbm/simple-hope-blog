import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, message, Popconfirm, Typography, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { getTags, createTag, deleteTag } from '@/lib/request'

interface Tag {
  id: string
  name: string
  slug: string
  postCount: number
  createdAt: string
}

export default function Tags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    setLoading(true)
    try {
      const res: any = await getTags()
      setTags(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    form.resetFields()
    setModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    await deleteTag(id)
    message.success('删除成功')
    fetchTags()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    try {
      await createTag(values)
      message.success('创建成功')
      setModalVisible(false)
      fetchTags()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const columns = [
    { title: '名称', dataIndex: 'name', render: (name: string) => <Tag>{name}</Tag> },
    { title: '别名', dataIndex: 'slug' },
    { title: '文章数', dataIndex: 'postCount', width: 100 },
    {
      title: '操作',
      width: 100,
      render: (_: any, record: Tag) => (
        <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" size="small" danger>删除</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography.Title level={4} className="m-0">标签管理</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建标签
        </Button>
      </div>

      <Table columns={columns} dataSource={tags} rowKey="id" loading={loading} />

      <Modal title="新建标签" open={modalVisible} onOk={handleSubmit} onCancel={() => setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="请输入标签名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}