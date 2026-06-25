import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, List, Tag, Typography, Spin } from 'antd'
import {
  RiseOutlined,
  FallOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  LikeOutlined,
  DislikeOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { newsApi, analysisApi } from '../services/api'
import { formatTime, sentimentColor, sentimentText, truncateText } from '../utils'

const { Title, Text } = Typography

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState({})
  const [trendData, setTrendData] = useState([])
  const [heatRanking, setHeatRanking] = useState([])
  const [sourceData, setSourceData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [latestNews, setLatestNews] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [stats, trend, heat, source, category, news] = await Promise.all([
        newsApi.getStatistics(),
        analysisApi.getSentimentTrend({ days: 7 }),
        analysisApi.getHeatRanking({ limit: 10 }),
        analysisApi.getSourceDistribution(),
        analysisApi.getCategoryStats(),
        newsApi.getList({ page: 1, pageSize: 8 })
      ])
      setStatistics(stats)
      setTrendData(trend)
      setHeatRanking(heat)
      setSourceData(source)
      setCategoryData(category)
      setLatestNews(news.list || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['正面', '负面', '中性'] },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.date?.substring(5) || '')
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '正面',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.positive),
        itemStyle: { color: '#52c41a' },
        areaStyle: { opacity: 0.1 }
      },
      {
        name: '负面',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.negative),
        itemStyle: { color: '#ff4d4f' },
        areaStyle: { opacity: 0.1 }
      },
      {
        name: '中性',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.neutral),
        itemStyle: { color: '#faad14' },
        areaStyle: { opacity: 0.1 }
      }
    ]
  }

  const heatOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 120, right: 20, top: 10, bottom: 30 },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: heatRanking.map(d => d.title?.substring(0, 15) || '').reverse()
    },
    series: [{
      type: 'bar',
      data: heatRanking.map(d => d.heatIndex).reverse(),
      itemStyle: {
        color: (params) => {
          const item = heatRanking[heatRanking.length - 1 - params.dataIndex]
          return sentimentColor[item?.sentiment] || '#1677ff'
        }
      },
      barWidth: 16
    }]
  }

  const sourceOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      },
      data: sourceData.map(d => ({ name: d.source, value: d.count }))
    }]
  }

  const categoryOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '65%',
      data: categoryData.map(d => ({ name: d.category, value: d.count })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        formatter: '{b}: {c} ({d}%)'
      }
    }]
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Title level={4} style={{ marginTop: 0 }}>数据概览</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="新闻总数"
              value={statistics.totalCount || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日新增"
              value={statistics.todayCount || 0}
              prefix={<PlusCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="正面占比"
              value={statistics.positiveRate || 0}
              suffix="%"
              prefix={<LikeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="负面占比"
              value={statistics.negativeRate || 0}
              suffix="%"
              prefix={<DislikeOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="情感趋势（近7天）">
            <ReactECharts option={trendOption} style={{ height: 320 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="热度排行榜">
            <ReactECharts option={heatOption} style={{ height: 320 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12} lg={8}>
          <Card title="来源分布">
            <ReactECharts option={sourceOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card title="分类统计">
            <ReactECharts option={categoryOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="最新舆情">
            <List
              size="small"
              dataSource={latestNews}
              renderItem={(item) => (
                <List.Item style={{ paddingLeft: 0, paddingRight: 0 }}>
                  <List.Item.Meta
                    title={
                      <Text
                        ellipsis
                        style={{ fontSize: 13, cursor: 'pointer' }}
                        title={item.title}
                      >
                        {item.title}
                      </Text>
                    }
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Tag color={sentimentColor[item.sentiment]} style={{ marginRight: 8 }}>
                          {sentimentText[item.sentiment]}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatTime(item.publishTime, 'MM-DD HH:mm')}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
