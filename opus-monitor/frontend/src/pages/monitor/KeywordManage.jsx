import { useState, useEffect } from 'react'
import {
  Card, Table, Button, Space, Modal, Form, Input, Select, Switch,
  message, Popconfirm, Tag, App
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { keywordApi } from '../../services/api'
import { formatTime, statusText, statusColor } from '../../utils'
import { useAuth } from '../../context/AuthContext'

const { Option } = Select

const KeywordManage = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()
  const { hasRole } = useAuth()
  const { message } = App.useApp()

  useEffect(() => {
    loadData()
  }, [page, pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await keywordApi.getList({ page, pageSize })
      setData(res.list || [])
      setTotal(res.total || 0)
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
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await keywordApi.delete(id)
      message.success('删除成功')
      loadData()
    } catch (err) {
      message.error(err.message)
    }
  }

  const handleToggleStatus = async (record, checked) => {
    try {
      await keywordApi.update(record._id, { status: checked ? 'active' : 'inactive' })
      message.success('状态已更新')
      loadData()
    } catch (err) {
      message.error(err.message)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        await keywordApi.update(editingItem._id, values)
        message.success('更新成功')
      } else {
        await keywordApi.create(values)
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
      title: '关键词',
      dataIndex: 'word',
      key: 'word',
      width: 200
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val) => (
        <Tag color={statusColor[val]}>{statusText[val]}</Tag>
      )
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
      width: 200,
      render: (_, record) => (
        <Space>
          <Switch
            checked={record.status === 'active'}
            onChange={(checked) => handleToggleStatus(record, checked)}
            size="small"
            disabled={!hasRole('analyst')}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={!hasRole('analyst')}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此关键词？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={!hasRole('analyst')}
            >
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
        title="关键词管理"
        extra={
          hasRole('analyst') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加关键词
            </Button>
          )
        }
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            }
          }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑关键词' : '添加关键词'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="word"
            label="关键词"
            rules={[{ required: true, message: '请输入关键词' }]}
          >
            <Input placeholder="请输入关键词" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select placeholder="请选择分类" allowClear>
              <Option value="默认">默认</Option>
              <Option value="经济">经济</Option>
              <Option value="科技">科技</Option>
              <Option value="社会">社会</Option>
              <Option value="政治">政治</Option>
              <Option value="娱乐">娱乐</Option>
              <Option value="体育">体育</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select>
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default KeywordManage
