import { useState, useEffect } from 'react'
import { Card, Radio, Row, Col, Statistic, Spin } from 'antd'
import ReactECharts from 'echarts-for-react'
import { analysisApi, newsApi } from '../../services/api'

const SentimentAnalysis = () => {
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(false)
  const [trendData, setTrendData] = useState([])
  const [statistics, setStatistics] = useState({})

  useEffect(() => {
    loadData()
  }, [days])

  const loadData = async () => {
    setLoading(true)
    try {
      const [trend, stats] = await Promise.all([
        analysisApi.getSentimentTrend({ days }),
        newsApi.getStatistics()
      ])
      setTrendData(trend)
      setStatistics(stats)
    } finally {
      setLoading(false)
    }
  }

  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['正面', '负面', '中性', '总量'] },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.date?.substring(5) || '')
    },
    yAxis: [
      { type: 'value', name: '数量' },
      { type: 'value', name: '总量', position: 'right' }
    ],
    series: [
      {
        name: '正面',
        type: 'bar',
        stack: 'sentiment',
        data: trendData.map(d => d.positive),
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '负面',
        type: 'bar',
        stack: 'sentiment',
        data: trendData.map(d => d.negative),
        itemStyle: { color: '#ff4d4f' }
      },
      {
        name: '中性',
        type: 'bar',
        stack: 'sentiment',
        data: trendData.map(d => d.neutral),
        itemStyle: { color: '#faad14' }
      },
      {
        name: '总量',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: trendData.map(d => d.total),
        itemStyle: { color: '#1677ff' },
        lineStyle: { width: 3 }
      }
    ]
  }

  const pieOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      data: [
        { value: statistics.positiveCount || 0, name: '正面', itemStyle: { color: '#52c41a' } },
        { value: statistics.negativeCount || 0, name: '负面', itemStyle: { color: '#ff4d4f' } },
        { value: statistics.neutralCount || 0, name: '中性', itemStyle: { color: '#faad14' } }
      ],
      label: {
        formatter: '{b}: {c} ({d}%)'
      }
    }]
  }

  return (
    <div>
      <Card
        title="情感趋势分析"
        extra={
          <Radio.Group value={days} onChange={(e) => setDays(e.target.value)}>
            <Radio.Button value={7}>近7天</Radio.Button>
            <Radio.Button value={15}>近15天</Radio.Button>
            <Radio.Button value={30}>近30天</Radio.Button>
          </Radio.Group>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 100 }}><Spin /></div>
        ) : (
          <ReactECharts option={trendOption} style={{ height: 400 }} />
        )}
      </Card>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="情感占比分布">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
            ) : (
              <ReactECharts option={pieOption} style={{ height: 320 }} />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="情感统计数据">
            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
              <Col span={12}>
                <Statistic
                  title="正面新闻"
                  value={statistics.positiveCount || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="负面新闻"
                  value={statistics.negativeCount || 0}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="中性新闻"
                  value={statistics.neutralCount || 0}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="新闻总数"
                  value={statistics.totalCount || 0}
                  valueStyle={{ color: '#1677ff' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SentimentAnalysis
