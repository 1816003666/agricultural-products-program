import { useState, useEffect } from 'react'
import { Card, Table, Tag, Select, Space, Button, message, Spin, Drawer, Descriptions, App } from 'antd'
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import { crawlApi } from '../../services/api'
import { formatTime, statusText, statusColor } from '../../utils'

const { Option } = Select

const TaskManage = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [status, setStatus] = useState('')
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const { message } = App.useApp()

  useEffect(() => {
    loadData()
  }, [page, pageSize, status])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = { page, pageSize }
      if (status) params.status = status
      const res = await crawlApi.getTasks(params)
      setData(res.list || [])
      setTotal(res.total || 0)
    } catch (err) {
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (record) => {
    try {
      const detail = await crawlApi.getTaskDetail(record._id)
      setCurrentTask(detail)
      setDetailVisible(true)
    } catch (err) {
      message.error(err.message)
    }
  }

  const columns = [
    {
      title: '新闻源',
      dataIndex: 'sourceName',
      key: 'sourceName',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val) => <Tag color={statusColor[val]}>{statusText[val]}</Tag>
    },
    {
      title: '触发方式',
      dataIndex: 'triggeredBy',
      key: 'triggeredBy',
      width: 100,
      render: (val) => val === 'manual' ? '手动触发' : '定时任务'
    },
    {
      title: '采集数量',
      dataIndex: 'newsCount',
      key: 'newsCount',
      width: 100
    },
    {
      title: '新增数量',
      dataIndex: 'newCount',
      key: 'newCount',
      width: 100
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 180,
      render: (val) => val ? formatTime(val) : '-'
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 180,
      render: (val) => val ? formatTime(val) : '-'
    },
    {
      title: '错误信息',
      dataIndex: 'errorMsg',
      key: 'errorMsg',
      ellipsis: true,
      render: (val) => val || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
          详情
        </Button>
      )
    }
  ]

  return (
    <div>
      <Card
        title="采集任务"
        extra={
          <Space>
            <Select
              placeholder="状态筛选"
              value={status || undefined}
              onChange={setStatus}
              style={{ width: 140 }}
              allowClear
            >
              <Option value="pending">待执行</Option>
              <Option value="running">执行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="failed">失败</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
          </Space>
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

      <Drawer
        title="任务详情"
        width={500}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {currentTask ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="新闻源">{currentTask.sourceName}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColor[currentTask.status]}>{statusText[currentTask.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="触发方式">
              {currentTask.triggeredBy === 'manual' ? '手动触发' : '定时任务'}
            </Descriptions.Item>
            <Descriptions.Item label="采集数量">{currentTask.newsCount}</Descriptions.Item>
            <Descriptions.Item label="新增数量">{currentTask.newCount}</Descriptions.Item>
            <Descriptions.Item label="开始时间">
              {currentTask.startTime ? formatTime(currentTask.startTime) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="结束时间">
              {currentTask.endTime ? formatTime(currentTask.endTime) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {formatTime(currentTask.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="错误信息">
              {currentTask.errorMsg || '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Spin />
        )}
      </Drawer>
    </div>
  )
}

export default TaskManage
