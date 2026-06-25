import { useState, useEffect } from 'react'
import { Card, Radio, Spin, Tag, List, Typography } from 'antd'
import ReactECharts from 'echarts-for-react'
import { analysisApi } from '../../services/api'
import { sentimentText, sentimentColor, formatTime } from '../../utils'

const { Text } = Typography

const HeatAnalysis = () => {
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(false)
  const [heatData, setHeatData] = useState([])

  useEffect(() => {
    loadData()
  }, [limit])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await analysisApi.getHeatRanking({ limit })
      setHeatData(data || [])
    } finally {
      setLoading(false)
    }
  }

  const barOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 200, right: 40, top: 20, bottom: 30 },
    xAxis: { type: 'value', name: '热度指数' },
    yAxis: {
      type: 'category',
      data: heatData.map(d => d.title?.substring(0, 20) || '').reverse(),
      axisLabel: { interval: 0 }
    },
    series: [{
      type: 'bar',
      data: heatData.map(d => d.heatIndex).reverse(),
      itemStyle: {
        color: (params) => {
          const idx = heatData.length - 1 - params.dataIndex
          return sentimentColor[heatData[idx]?.sentiment] || '#1677ff'
        },
        borderRadius: [0, 4, 4, 0]
      },
      barWidth: 18,
      label: {
        show: true,
        position: 'right',
        formatter: '{c}'
      }
    }]
  }

  const lineOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 30, bottom: 60 },
    xAxis: {
      type: 'category',
      data: heatData.slice(0, 15).map((_, i) => `TOP${i + 1}`),
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value', name: '热度指数' },
    series: [{
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: heatData.slice(0, 15).map(d => d.heatIndex),
      itemStyle: { color: '#1677ff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(22, 119, 255, 0.5)' },
            { offset: 1, color: 'rgba(22, 119, 255, 0.05)' }
          ]
        }
      }
    }]
  }

  return (
    <div>
      <Card
        title="热度排行分析"
        extra={
          <Radio.Group value={limit} onChange={(e) => setLimit(e.target.value)}>
            <Radio.Button value={10}>TOP 10</Radio.Button>
            <Radio.Button value={20}>TOP 20</Radio.Button>
            <Radio.Button value={50}>TOP 50</Radio.Button>
          </Radio.Group>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 100 }}><Spin /></div>
        ) : (
          <ReactECharts option={barOption} style={{ height: 500 }} />
        )}
      </Card>

      <Card title="热度趋势（TOP15）" style={{ marginTop: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
        ) : (
          <ReactECharts option={lineOption} style={{ height: 350 }} />
        )}
      </Card>

      <Card title="热点新闻详情" style={{ marginTop: 16 }}>
        <List
          dataSource={heatData.slice(0, 10)}
          renderItem={(item, index) => (
            <List.Item key={item._id}>
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Tag color={index < 3 ? 'red' : 'blue'} style={{ marginRight: 12 }}>
                      TOP {index + 1}
                    </Tag>
                    <Text strong>{item.title}</Text>
                  </div>
                }
                description={
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <Tag color={sentimentColor[item.sentiment]}>
                      {sentimentText[item.sentiment]}
                    </Tag>
                    <Tag>热度: {item.heatIndex}</Tag>
                    <Tag>{item.source}</Tag>
                    <Text type="secondary">{formatTime(item.publishTime)}</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default HeatAnalysis
