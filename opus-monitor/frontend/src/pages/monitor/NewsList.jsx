import { useState, useEffect } from 'react'
import {
  Card, Table, Input, Select, DatePicker, Button, Space, Tag,
  Drawer, Descriptions, Divider, App, Spin
} from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { newsApi } from '../../services/api'
import { formatTime, sentimentText, sentimentColor, truncateText, categoryList } from '../../utils'

const { RangePicker } = DatePicker
const { Option } = Select

const NewsList = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [keyword, setKeyword] = useState('')
  const [sentiment, setSentiment] = useState('')
  const [category, setCategory] = useState('')
  const [dateRange, setDateRange] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentNews, setCurrentNews] = useState(null)
  const { message } = App.useApp()

  useEffect(() => {
    loadData()
  }, [page, pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = { page, pageSize }
      if (keyword) params.keyword = keyword
      if (sentiment) params.sentiment = sentiment
      if (category) params.category = category
      if (dateRange && dateRange.length === 2) {
        params.startTime = dateRange[0].startOf('day').toISOString()
        params.endTime = dateRange[1].endOf('day').toISOString()
      }
      const res = await newsApi.getList(params)
      setData(res.list || [])
      setTotal(res.total || 0)
    } catch (err) {
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadData()
  }

  const handleReset = () => {
    setKeyword('')
    setSentiment('')
    setCategory('')
    setDateRange(null)
    setPage(1)
    setTimeout(() => loadData(), 0)
  }

  const handleViewDetail = async (record) => {
    try {
      const detail = await newsApi.getDetail(record._id)
      setCurrentNews(detail)
      setDetailVisible(true)
    } catch (err) {
      message.error(err.message)
    }
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 300,
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)} title={text}>{text}</a>
      )
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 80
    },
    {
      title: '情感倾向',
      dataIndex: 'sentiment',
      key: 'sentiment',
      width: 100,
      render: (val) => (
        <Tag color={sentimentColor[val]}>{sentimentText[val]}</Tag>
      )
    },
    {
      title: '热度指数',
      dataIndex: 'heatIndex',
      key: 'heatIndex',
      width: 100,
      sorter: (a, b) => a.heatIndex - b.heatIndex,
      defaultSortOrder: 'descend'
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 160,
      render: (val) => formatTime(val),
      sorter: (a, b) => new Date(a.publishTime) - new Date(b.publishTime)
    }
  ]

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索关键词"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="情感倾向"
            value={sentiment || undefined}
            onChange={setSentiment}
            style={{ width: 120 }}
            allowClear
          >
            <Option value="positive">正面</Option>
            <Option value="negative">负面</Option>
            <Option value="neutral">中性</Option>
          </Select>
          <Select
            placeholder="分类"
            value={category || undefined}
            onChange={setCategory}
            style={{ width: 120 }}
            allowClear
          >
            {categoryList.map(c => (
              <Option key={c} value={c}>{c}</Option>
            ))}
          </Select>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="YYYY-MM-DD"
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
      </Card>

      <Card>
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
        title="新闻详情"
        width={720}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {currentNews ? (
          <>
            <h2 style={{ marginBottom: 8 }}>{currentNews.title}</h2>
            <div style={{ marginBottom: 16 }}>
              <Tag color={sentimentColor[currentNews.sentiment]}>
                {sentimentText[currentNews.sentiment]} ({currentNews.sentimentScore?.toFixed(2)})
              </Tag>
              <Tag>热度: {currentNews.heatIndex}</Tag>
              <Tag>{currentNews.category}</Tag>
            </div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="来源">{currentNews.source}</Descriptions.Item>
              <Descriptions.Item label="作者">{currentNews.author || '-'}</Descriptions.Item>
              <Descriptions.Item label="发布时间">
                {formatTime(currentNews.publishTime)}
              </Descriptions.Item>
              <Descriptions.Item label="采集时间">
                {formatTime(currentNews.crawledAt)}
              </Descriptions.Item>
              <Descriptions.Item label="原文链接" span={2}>
                <a href={currentNews.sourceUrl} target="_blank" rel="noreferrer">
                  {currentNews.sourceUrl}
                </a>
              </Descriptions.Item>
            </Descriptions>
            <Divider>正文</Divider>
            <div style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {currentNews.content}
            </div>
          </>
        ) : (
          <Spin />
        )}
      </Drawer>
    </div>
  )
}

export default NewsList
