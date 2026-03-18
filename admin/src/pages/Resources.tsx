import { useEffect, useState, useCallback } from 'react'
import { Table, Button, message, Popconfirm, Modal, Input, Select, Space, Upload, Card, Statistic, Row, Col } from 'antd'
import { UploadOutlined, DownloadOutlined, DeleteOutlined, FileOutlined, FileTextOutlined, PictureOutlined, FolderOutlined, CodeOutlined, ReloadOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { getResources, uploadResource, createTextResource, updateResource, deleteResource, getResourceStats } from '@/lib/request'
import api from '@/lib/api'

interface Resource {
  id: string
  name: string
  type: 'file' | 'text'
  mimeType?: string
  size?: number
  path?: string
  content?: string
  category?: string
  downloads: number
  createdAt: string
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [stats, setStats] = useState({ totalFiles: 0, totalTexts: 0, totalSize: 0 })
  const [filters, setFilters] = useState({ type: '', category: '', search: '' })
  const [textModal, setTextModal] = useState(false)
  const [textForm, setTextForm] = useState({ name: '', content: '', category: 'document' })
  const [editModal, setEditModal] = useState(false)
  const [editResourceData, setEditResourceData] = useState<Resource | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [confirmModal, setConfirmModal] = useState(false)

  useEffect(() => {
    fetchResources()
    fetchStats()
  }, [filters])

  const fetchResources = async (page = 1) => {
    setLoading(true)
    try {
      const params: any = { page, pageSize: 20 }
      if (filters.type) params.type = filters.type
      if (filters.category) params.category = filters.category
      if (filters.search) params.search = filters.search

      const res: any = await getResources(params)
      setResources(res.data.list)
      setPagination({ ...pagination, page, total: res.data.pagination.total })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res: any = await getResourceStats()
      setStats(res.data)
    } catch (e) {
      console.error('Failed to fetch stats', e)
    }
  }

  // 拖拽上传
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setPendingFiles(files)
      setConfirmModal(true)
    }
  }, [])

  const uploadFiles = async () => {
    if (pendingFiles.length === 0) return
    
    setConfirmModal(false)
    const hide = message.loading('上传中...', 0)
    try {
      for (const file of pendingFiles) {
        await uploadResource(file)
      }
      message.success('上传成功')
      fetchResources(pagination.page)
      fetchStats()
    } catch (e: any) {
      message.error(e.message || '上传失败')
    } finally {
      hide()
      setPendingFiles([])
    }
  }

  const handleUpload: UploadProps['beforeUpload'] = async (file) => {
    setPendingFiles([file])
    setConfirmModal(true)
    return false
  }

  const createText = async () => {
    if (!textForm.name || !textForm.content) {
      return message.error('名称和内容不能为空')
    }

    try {
      await createTextResource(textForm)
      message.success('创建成功')
      setTextModal(false)
      setTextForm({ name: '', content: '', category: 'document' })
      fetchResources(pagination.page)
      fetchStats()
    } catch (e: any) {
      message.error(e.message || '创建失败')
    }
  }

  const updateTextResource = async () => {
    if (!editResourceData) return
    
    try {
      await updateResource(editResourceData.id, {
        name: editResourceData.name,
        content: editResourceData.content
      })
      message.success('更新成功')
      setEditModal(false)
      setEditResourceData(null)
      fetchResources(pagination.page)
    } catch (e: any) {
      message.error(e.message || '更新失败')
    }
  }

  const deleteResourceById = async (id: string) => {
    try {
      await deleteResource(id)
      message.success('删除成功')
      fetchResources(pagination.page)
      fetchStats()
    } catch (e: any) {
      message.error(e.message || '删除失败')
    }
  }

  const downloadResourceFile = async (id: string) => {
    try {
      const res: any = await api.get(`/resources/${id}/download`, { responseType: 'blob' })
      const blob = res
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'download'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      message.error('下载失败')
    }
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
  }

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'image': return <PictureOutlined className="text-green-500" />
      case 'document': return <FileOutlined className="text-blue-500" />
      case 'code': return <CodeOutlined className="text-purple-500" />
      case 'archive': return <FolderOutlined className="text-orange-500" />
      default: return <FolderOutlined className="text-gray-500" />
    }
  }

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (type: string, record: Resource) => (
        type === 'text' ? <FileTextOutlined className="text-blue-500 text-lg" /> : getCategoryIcon(record.category)
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (name: string) => (
        <span className="font-medium">{name}</span>
      ),
    },
    {
      title: '类型/格式',
      dataIndex: 'mimeType',
      width: 120,
      render: (mimeType: string, record: Resource) => (
        record.type === 'text' ? '文本' : (mimeType?.split('/')[1]?.toUpperCase() || '-')
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      width: 100,
      render: formatSize,
    },
    {
      title: '下载次数',
      dataIndex: 'downloads',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      width: 150,
      render: (_: any, record: Resource) => (
        <Space>
          <Button 
            type="link" 
            size="small" 
            icon={<DownloadOutlined />}
            onClick={() => downloadResourceFile(record.id)}
          >
            下载
          </Button>
          {record.type === 'text' && (
            <Button 
              type="link" 
              size="small"
              onClick={() => { setEditResourceData(record); setEditModal(true) }}
            >
              编辑
            </Button>
          )}
          <Popconfirm title="确定删除？" onConfirm={() => deleteResourceById(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div 
      className="relative min-h-screen"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {/* 拖拽遮罩 */}
      {dragActive && (
        <div className="fixed inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-dashed border-blue-500 m-4 rounded-xl">
          <div className="text-center">
            <div className="text-6xl mb-4">📁</div>
            <div className="text-2xl font-bold text-blue-600">拖放文件到此处上传</div>
            <div className="text-gray-500 mt-2">支持最大 1GB 文件</div>
          </div>
        </div>
      )}

      {/* 统计卡片 */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic title="文件数量" value={stats.totalFiles} prefix={<FolderOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="文本数量" value={stats.totalTexts} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="总大小" value={formatSize(stats.totalSize)} />
          </Card>
        </Col>
      </Row>

      {/* 操作栏 */}
      <div className="flex justify-between items-center mb-4">
        <Space>
          <Select
            placeholder="类型筛选"
            allowClear
            style={{ width: 120 }}
            value={filters.type || undefined}
            onChange={(v) => setFilters({ ...filters, type: v || '' })}
          >
            <Select.Option value="file">文件</Select.Option>
            <Select.Option value="text">文本</Select.Option>
          </Select>
          <Select
            placeholder="分类筛选"
            allowClear
            style={{ width: 120 }}
            value={filters.category || undefined}
            onChange={(v) => setFilters({ ...filters, category: v || '' })}
          >
            <Select.Option value="image">图片</Select.Option>
            <Select.Option value="document">文档</Select.Option>
            <Select.Option value="code">代码</Select.Option>
            <Select.Option value="archive">压缩包</Select.Option>
            <Select.Option value="other">其他</Select.Option>
          </Select>
          <Input.Search
            placeholder="搜索名称"
            style={{ width: 200 }}
            onSearch={(v) => setFilters({ ...filters, search: v })}
          />
        </Space>
        
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchResources(pagination.page)}>
            刷新
          </Button>
          <Upload beforeUpload={handleUpload} showUploadList={false}>
            <Button type="primary" icon={<UploadOutlined />}>上传文件</Button>
          </Upload>
          <Button icon={<FileTextOutlined />} onClick={() => setTextModal(true)}>
            新建文本
          </Button>
        </Space>
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={resources}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          total: pagination.total,
          pageSize: pagination.pageSize,
          onChange: fetchResources,
        }}
      />

      {/* 上传确认弹窗 */}
      <Modal
        title="确认上传"
        open={confirmModal}
        onOk={uploadFiles}
        onCancel={() => { setConfirmModal(false); setPendingFiles([]) }}
        okText="确认上传"
        cancelText="取消"
      >
        <div className="mb-4">以下文件将被上传：</div>
        <div className="max-h-60 overflow-auto border rounded p-2">
          {pendingFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-2">
                <FileOutlined />
                <span>{file.name}</span>
              </div>
              <span className="text-gray-400">{formatSize(file.size)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-gray-500 text-sm">
          共 {pendingFiles.length} 个文件，总大小 {formatSize(pendingFiles.reduce((sum, f) => sum + f.size, 0))}
        </div>
      </Modal>

      {/* 新建文本弹窗 */}
      <Modal
        title="新建文本"
        open={textModal}
        onOk={createText}
        onCancel={() => setTextModal(false)}
        width={600}
      >
        <div className="space-y-4">
          <Input
            placeholder="名称"
            value={textForm.name}
            onChange={(e) => setTextForm({ ...textForm, name: e.target.value })}
          />
          <Select
            style={{ width: '100%' }}
            value={textForm.category}
            onChange={(v) => setTextForm({ ...textForm, category: v })}
          >
            <Select.Option value="document">文档</Select.Option>
            <Select.Option value="code">代码</Select.Option>
          </Select>
          <Input.TextArea
            placeholder="内容"
            rows={10}
            value={textForm.content}
            onChange={(e) => setTextForm({ ...textForm, content: e.target.value })}
          />
        </div>
      </Modal>

      {/* 编辑文本弹窗 */}
      <Modal
        title="编辑文本"
        open={editModal}
        onOk={updateTextResource}
        onCancel={() => { setEditModal(false); setEditResourceData(null) }}
        width={600}
      >
        {editResourceData && (
          <div className="space-y-4">
            <Input
              placeholder="名称"
              value={editResourceData.name}
              onChange={(e) => setEditResourceData({ ...editResourceData, name: e.target.value })}
            />
            <Input.TextArea
              placeholder="内容"
              rows={10}
              value={editResourceData.content || ''}
              onChange={(e) => setEditResourceData({ ...editResourceData, content: e.target.value })}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}