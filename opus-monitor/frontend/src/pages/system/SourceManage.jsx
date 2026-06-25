import { useState, useEffect } from 'react'
import {
  Card, Table, Button, Space, Modal, Form, Input, Select,
  message, Popconfirm, Tag, Collapse
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { sourceApi, crawlApi } from '../../services/api'
import { formatTime, statusText, statusColor } from '../../utils'

const { Option } = Select
const { Panel } = Collapse

const SourceManage = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await sourceApi.getList()
      setData(res.list || [])
    } catch (err) {
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue({
      ...record,
      selectorConfig: record.selectorConfig || {}
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await sourceApi.delete(id)
      message.success('删除成功')
      loadData()
    } catch (err) {
      message.error(err.message)
    }
  }

  const handleCrawl = async (sourceId) => {
    try {
      await crawlApi.trigger(sourceId)
      message.success('采集任务已启动')
    } catch (err) {
      message.error(err.message)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        await sourceApi.update(editingItem._id, values)
        message.success('更新成功')
      } else {
        await sourceApi.create(values)
        message.success('添加成功')
      }
      setModalVisible(false)
      loadData()
    } catch (err) {
      if (err.errorFields) return
      message.error(err.message)
    }
  }

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '网址',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (val) => (
        <a href={val} target="_blank" rel="noreferrer">{val}</a>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val) => <Tag color={statusColor[val]}>{statusText[val]}</Tag>
    },
    {
      title: '最后采集',
      dataIndex: 'lastCrawlTime',
      key: 'lastCrawlTime',
      width: 180,
      render: (val) => val ? formatTime(val) : '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (val) => formatTime(val)
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => handleCrawl(record._id)}
          >
            立即采集
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除此新闻源？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card
        title="新闻源管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增新闻源
          </Button>
        }
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑新闻源' : '新增新闻源'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入新闻源名称" />
          </Form.Item>
          <Form.Item
            name="url"
            label="主页URL"
            rules={[{ required: true, message: '请输入URL' }]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
          <Form.Item
            name="listUrl"
            label="列表页URL"
          >
            <Input placeholder="新闻列表页面地址" />
          </Form.Item>
          <Form.Item name="type" label="类型" initialValue="crawler">
            <Select>
              <Option value="crawler">爬虫</Option>
              <Option value="rss">RSS</Option>
              <Option value="api">API</Option>
            </Select>
          </Form.Item>
          <Form.Item name="crawlInterval" label="采集间隔（cron表达式）" initialValue="0 */2 * * *">
            <Input placeholder="0 */2 * * *" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select>
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>

          <Collapse ghost>
            <Panel header="爬虫选择器配置（高级）" key="selectors">
              <Form.Item name={['selectorConfig', 'listItem']} label="列表项选择器">
                <Input placeholder="article, .news-item" />
              </Form.Item>
              <Form.Item name={['selectorConfig', 'title']} label="标题选择器">
                <Input placeholder="h1, .title" />
              </Form.Item>
              <Form.Item name={['selectorConfig', 'content']} label="正文选择器">
                <Input placeholder=".content, .article-content" />
              </Form.Item>
              <Form.Item name={['selectorConfig', 'publishTime']} label="发布时间选择器">
                <Input placeholder=".time, .date" />
              </Form.Item>
              <Form.Item name={['selectorConfig', 'author']} label="作者选择器">
                <Input placeholder=".author" />
              </Form.Item>
            </Panel>
          </Collapse>
        </Form>
      </Modal>
    </div>
  )
}

export default SourceManage
