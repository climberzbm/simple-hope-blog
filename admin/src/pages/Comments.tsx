import { useEffect, useState } from 'react'
import { Table, Button, Tag, message, Popconfirm, Typography, Select } from 'antd'
import { getComments, auditComment, deleteComment } from '@/lib/request'

const { Option } = Select

export default function Comments() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    fetchComments()
  }, [statusFilter])

  const fetchComments = async (page = 1) => {
    setLoading(true)
    try {
      const res: any = await getComments({ page, pageSize: 10, status: statusFilter })
      setComments(res.data.list)
      setPagination({ ...pagination, page, total: res.data.pagination.total })
    } finally {
      setLoading(false)
    }
  }

  const handleAudit = async (id: string, status: string) => {
    await auditComment(id, status)
    message.success('操作成功')
    fetchComments(pagination.page)
  }

  const handleDelete = async (id: string) => {
    await deleteComment(id)
    message.success('删除成功')
    fetchComments(pagination.page)
  }

  const statusMap: Record<string, { color: string; text: string }> = {
    pending: { color: 'orange', text: '待审核' },
    approved: { color: 'green', text: '已通过' },
    spam: { color: 'red', text: '垃圾' },
  }

  const columns = [
    { title: '用户', dataIndex: ['user', 'nickname'], width: 100 },
    { title: '内容', dataIndex: 'content', ellipsis: true },
    { title: '文章', dataIndex: ['post', 'title'], ellipsis: true, width: 150 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const { color, text } = statusMap[status] || { color: 'default', text: status }
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '操作',
      width: 180,
      render: (_: any, record: any) => (
        <div className="space-x-2">
          {record.status === 'pending' && (
            <>
              <Button size="small" type="primary" onClick={() => handleAudit(record.id, 'approved')}>
                通过
              </Button>
              <Button size="small" danger onClick={() => handleAudit(record.id, 'spam')}>
                垃圾
              </Button>
            </>
          )}
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography.Title level={4} className="m-0">评论管理</Typography.Title>
        <Select
          allowClear
          placeholder="筛选状态"
          style={{ width: 120 }}
          onChange={(value) => setStatusFilter(value)}
        >
          <Option value="pending">待审核</Option>
          <Option value="approved">已通过</Option>
          <Option value="spam">垃圾</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={comments}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          total: pagination.total,
          onChange: fetchComments,
        }}
      />
    </div>
  )
}