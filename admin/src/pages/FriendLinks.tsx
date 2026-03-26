import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, message, Popconfirm, Typography, Space, Tag, Select } from 'antd'
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import api from '@/lib/api'

interface FriendLink {
  id: string
  name: string
  url: string
  avatar?: string
  description?: string
  status: 'pending' | 'approved' | 'rejected'
  order: number
  createdAt: string
}

const statusMap = {
  pending: { text: '待审核', color: 'warning' },
  approved: { text: '已通过', color: 'success' },
  rejected: { text: '已拒绝', color: 'error' },
}

export default function FriendLinks() {
  const [links, setLinks] = useState<FriendLink[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingLink, setEditingLink] = useState<FriendLink | null>(null)
  const [form] = Form.useForm()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    setLoading(true)
    try {
      const res: any = await api.get('/friend-links/admin/list', { params: { pageSize: 100 } })
      setLinks(res.data?.list || [])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingLink(null)
    form.resetFields()
    form.setFieldsValue({ status: 'approved' })
    setModalVisible(true)
  }

  const handleEdit = (record: FriendLink) => {
    setEditingLink(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    await api.delete(`/friend-links/admin/${id}`)
    message.success('删除成功')
    fetchLinks()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    try {
      if (editingLink) {
        await api.put(`/friend-links/admin/${editingLink.id}`, values)
        message.success('更新成功')
      } else {
        await api.post('/friend-links/admin', values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchLinks()
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败')
    }
  }

  const handleAudit = async (status: 'approved' | 'rejected') => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要审核的友链')
      return
    }
    try {
      const res: any = await api.post('/friend-links/admin/audit', {
        ids: selectedRowKeys,
        status,
      })
      message.success(res.message)
      setSelectedRowKeys([])
      fetchLinks()
    } catch (error: any) {
      message.error(error.response?.data?.message || '审核失败')
    }
  }

  const columns = [
    {
      title: '网站名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '网址',
      dataIndex: 'url',
      width: 200,
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {url}
        </a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: 'pending' | 'approved' | 'rejected') => (
        <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'order',
      width: 80,
    },
    {
      title: '操作',
      width: 150,
      render: (_: any, record: FriendLink) => (
        <Space>
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
        <Typography.Title level={4} className="m-0">友链管理</Typography.Title>
        <Space>
          {selectedRowKeys.length > 0 && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleAudit('approved')}
              >
                批量通过
              </Button>
              <Button icon={<CloseOutlined />} onClick={() => handleAudit('rejected')}>
                批量拒绝
              </Button>
            </>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建友链
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={links}
        rowKey="id"
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
      />

      <Modal
        title={editingLink ? '编辑友链' : '新建友链'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="网站名称" rules={[{ required: true }]}>
            <Input placeholder="请输入网站名称" />
          </Form.Item>
          <Form.Item name="url" label="网站地址" rules={[{ required: true, type: 'url' }]}>
            <Input placeholder="https://example.com" />
          </Form.Item>
          <Form.Item name="avatar" label="头像地址">
            <Input placeholder="https://example.com/avatar.png" />
          </Form.Item>
          <Form.Item name="description" label="网站描述">
            <Input.TextArea rows={2} maxLength={200} placeholder="网站简介" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="pending">待审核</Select.Option>
              <Select.Option value="approved">已通过</Select.Option>
              <Select.Option value="rejected">已拒绝</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="order" label="排序权重">
            <Input type="number" placeholder="数字越大越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}