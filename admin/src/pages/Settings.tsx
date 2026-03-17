import { useEffect, useState } from 'react'
import { Form, Input, Button, Card, message, Typography, Divider } from 'antd'
import { getSettings, updateSettings, getAbout, updateAbout } from '@/lib/request'

const { TextArea } = Input
const { Title } = Typography

export default function Settings() {
  const [loading, setLoading] = useState(false)
  const [settingsForm] = Form.useForm()
  const [aboutForm] = Form.useForm()

  useEffect(() => {
    fetchSettings()
    fetchAbout()
  }, [])

  const fetchSettings = async () => {
    try {
      const res: any = await getSettings()
      settingsForm.setFieldsValue(res.data)
    } catch (error) {}
  }

  const fetchAbout = async () => {
    try {
      const res: any = await getAbout()
      aboutForm.setFieldsValue({ content: res.data.content })
    } catch (error) {}
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      const values = await settingsForm.validateFields()
      await updateSettings(values)
      message.success('保存成功')
    } catch (error: any) {
      message.error(error.message || '保存失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAbout = async () => {
    setLoading(true)
    try {
      const values = await aboutForm.validateFields()
      await updateAbout(values.content)
      message.success('保存成功')
    } catch (error: any) {
      message.error(error.message || '保存失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Title level={4} className="mb-6">系统设置</Title>

      <Card title="站点设置" className="mb-6">
        <Form form={settingsForm} layout="vertical">
          <Form.Item name="site_title" label="站点标题">
            <Input placeholder="Simple Hope Blog" />
          </Form.Item>
          <Form.Item name="site_description" label="站点描述">
            <TextArea rows={2} placeholder="个人技术博客" />
          </Form.Item>
          <Form.Item name="site_author" label="作者">
            <Input placeholder="climberzbm" />
          </Form.Item>
          <Button type="primary" onClick={handleSaveSettings} loading={loading}>
            保存设置
          </Button>
        </Form>
      </Card>

      <Card title="关于页面">
        <Form form={aboutForm} layout="vertical">
          <Form.Item name="content" label="内容 (支持 Markdown)">
            <TextArea rows={10} placeholder="# 关于我&#10;&#10;这里是关于我的介绍..." />
          </Form.Item>
          <Button type="primary" onClick={handleSaveAbout} loading={loading}>
            保存内容
          </Button>
        </Form>
      </Card>
    </div>
  )
}