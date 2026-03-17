import { useEffect, useState } from 'react'
import { Table, Upload, Button, message, Popconfirm, Typography, Image } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import { getMedia, uploadImage, deleteMedia } from '@/lib/request'

export default function Media() {
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async (page = 1) => {
    setLoading(true)
    try {
      const res: any = await getMedia({ page, pageSize: 20 })
      setMedia(res.data.list)
      setPagination({ ...pagination, page, total: res.data.pagination.total })
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (file: File) => {
    try {
      await uploadImage(file)
      message.success('上传成功')
      fetchMedia()
    } catch (error: any) {
      message.error(error.message || '上传失败')
    }
    return false
  }

  const handleDelete = async (id: string) => {
    await deleteMedia(id)
    message.success('删除成功')
    fetchMedia(pagination.page)
  }

  const columns = [
    {
      title: '预览',
      dataIndex: 'url',
      width: 100,
      render: (url: string) => (
        <Image src={`http://localhost:3001${url}`} width={60} height={60} style={{ objectFit: 'cover' }} />
      ),
    },
    { title: '文件名', dataIndex: 'filename', ellipsis: true },
    { title: 'URL', dataIndex: 'url', ellipsis: true },
    {
      title: '大小',
      dataIndex: 'size',
      width: 100,
      render: (size: number) => `${(size / 1024).toFixed(1)} KB`,
    },
    {
      title: '操作',
      width: 100,
      render: (_: any, record: any) => (
        <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" size="small" danger>删除</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography.Title level={4} className="m-0">媒体库</Typography.Title>
        <Upload beforeUpload={handleUpload} showUploadList={false}>
          <Button icon={<UploadOutlined />}>上传图片</Button>
        </Upload>
      </div>

      <Table
        columns={columns}
        dataSource={media}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          total: pagination.total,
          onChange: fetchMedia,
        }}
      />
    </div>
  )
}