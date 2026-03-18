import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  Form,
  Input,
  Select,
  Switch,
  message,
  Typography,
  Space,
  Modal,
  Table,
  Image,
  Upload,
  Tabs,
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons'
import { getCategories, getTags, uploadImage, getMedia } from '@/lib/request'
import api from '@/lib/api'

const { TextArea } = Input
const { Option } = Select

export default function PostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [mediaModalVisible, setMediaModalVisible] = useState(false)
  const [mediaList, setMediaList] = useState<any[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)

  const isEdit = !!id

  useEffect(() => {
    fetchCategories()
    fetchTags()
    if (isEdit) {
      fetchPost()
    }
  }, [id])

  const fetchCategories = async () => {
    const res: any = await getCategories()
    setCategories(res.data)
  }

  const fetchTags = async () => {
    const res: any = await getTags()
    setTags(res.data)
  }

  const fetchPost = async () => {
    try {
      const res: any = await api.get(`/posts/admin/${id}`)
      const post = res.data
      form.setFieldsValue({
        title: post.title,
        content: post.content || '',
        excerpt: post.excerpt || '',
        categoryId: post.category?.id,
        tagIds: post.tags?.map((t: any) => t.id),
        status: post.status,
        isTop: post.isTop,
      })
    } catch (error) {
      message.error('获取文章详情失败')
      navigate('/posts')
    }
  }

  const fetchMedia = async () => {
    setMediaLoading(true)
    try {
      const res: any = await getMedia({ page: 1, pageSize: 50 })
      setMediaList(res.data.list)
    } finally {
      setMediaLoading(false)
    }
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/posts/${id}`, values)
        message.success('更新成功')
      } else {
        await api.post('/posts', values)
        message.success('创建成功')
      }
      navigate('/posts')
    } catch (error: any) {
      message.error(error.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleInsertImage = () => {
    setMediaModalVisible(true)
    fetchMedia()
  }

  const handleUploadImage = async (file: File) => {
    try {
      await uploadImage(file)
      message.success('上传成功')
      fetchMedia()
    } catch (error: any) {
      message.error(error.message || '上传失败')
    }
    return false
  }

  const handleSelectImage = (url: string, filename: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const content = form.getFieldValue('content') || ''
      const imageMarkdown = `![${filename}](${url})`
      const newContent = content.substring(0, start) + imageMarkdown + content.substring(end)
      form.setFieldValue('content', newContent)
      setMediaModalVisible(false)
    }
  }

  const mediaColumns = [
    {
      title: '预览',
      dataIndex: 'url',
      width: 80,
      render: (url: string) => (
        <Image src={url} width={50} height={50} style={{ objectFit: 'cover' }} />
      ),
    },
    { title: '文件名', dataIndex: 'filename', ellipsis: true },
    {
      title: '操作',
      width: 80,
      render: (_: any, record: any) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleSelectImage(record.url, record.filename || 'image')}
        >
          插入
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/posts')}>
            返回
          </Button>
          <Typography.Title level={4} className="m-0">
            {isEdit ? '编辑文章' : '新建文章'}
          </Typography.Title>
        </Space>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
          保存
        </Button>
      </div>

      <Form form={form} layout="vertical" className="bg-white p-6 rounded-lg">
        {/* 顶部字段区域 */}
        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="title" label="标题" rules={[{ required: true }]} className="col-span-2">
            <Input placeholder="请输入文章标题" size="large" />
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

          <Form.Item name="excerpt" label="摘要" className="col-span-2">
            <TextArea rows={2} placeholder="文章摘要，可选" />
          </Form.Item>
        </div>

        {/* 内容编辑区 */}
        <Form.Item
          name="content"
          label="内容"
          rules={[{ required: true }]}
          className="mt-4"
        >
          <TextArea
            rows={20}
            placeholder="支持 Markdown 格式"
            className="font-mono"
          />
        </Form.Item>

        {/* 插入图片按钮 */}
        <div className="flex justify-end">
          <Button icon={<PictureOutlined />} onClick={handleInsertImage}>
            插入图片
          </Button>
        </div>
      </Form>

      {/* 图片选择弹窗 */}
      <Modal
        title="插入图片"
        open={mediaModalVisible}
        onCancel={() => setMediaModalVisible(false)}
        footer={null}
        width={800}
      >
        <Tabs
          items={[
            {
              key: 'library',
              label: '媒体库',
              children: (
                <Table
                  columns={mediaColumns}
                  dataSource={mediaList}
                  rowKey="id"
                  loading={mediaLoading}
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              ),
            },
            {
              key: 'upload',
              label: '上传图片',
              children: (
                <div className="p-8">
                  <Upload.Dragger
                    beforeUpload={handleUploadImage}
                    showUploadList={false}
                    accept="image/*"
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
                  </Upload.Dragger>
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  )
}