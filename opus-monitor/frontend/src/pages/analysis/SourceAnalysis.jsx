import { useState, useEffect } from 'react'
import { Card, Row, Col, Spin } from 'antd'
import ReactECharts from 'echarts-for-react'
import 'echarts-wordcloud'
import { analysisApi } from '../../services/api'

const SourceAnalysis = () => {
  const [loading, setLoading] = useState(false)
  const [sourceData, setSourceData] = useState([])
  const [wordCloudData, setWordCloudData] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [source, wordCloud] = await Promise.all([
        analysisApi.getSourceDistribution(),
        analysisApi.getWordCloud()
      ])
      setSourceData(source || [])
      setWordCloudData(wordCloud || [])
    } finally {
      setLoading(false)
    }
  }

  const pieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} 篇 ({d}%)' },
    legend: { orient: 'vertical', left: 'left', top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['65%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      data: sourceData.map(d => ({ name: d.source, value: d.count }))
    }]
  }

  const barOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['总量', '正面', '负面'] },
    grid: { left: 50, right: 20, top: 40, bottom: 40 },
    xAxis: {
      type: 'category',
      data: sourceData.map(d => d.source),
      axisLabel: { rotate: 30 }
    },
    yAxis: { type: 'value', name: '数量' },
    series: [
      {
        name: '总量',
        type: 'bar',
        data: sourceData.map(d => d.count),
        itemStyle: { color: '#1677ff' }
      },
      {
        name: '正面',
        type: 'bar',
        data: sourceData.map(d => d.positive),
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '负面',
        type: 'bar',
        data: sourceData.map(d => d.negative),
        itemStyle: { color: '#ff4d4f' }
      }
    ]
  }

  const wordCloudOption = {
    tooltip: { show: true },
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '90%',
      height: '90%',
      sizeRange: [12, 60],
      rotationRange: [-45, 45],
      rotationStep: 15,
      gridSize: 8,
      drawOutOfBound: false,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: () => {
          const colors = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96']
          return colors[Math.floor(Math.random() * colors.length)]
        }
      },
      emphasis: {
        textStyle: { textShadowBlur: 10, textShadowColor: '#333' }
      },
      data: wordCloudData
    }]
  }

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="来源分布">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 80 }}><Spin /></div>
            ) : (
              <ReactECharts option={pieOption} style={{ height: 350 }} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="各来源情感对比">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 80 }}><Spin /></div>
            ) : (
              <ReactECharts option={barOption} style={{ height: 350 }} />
            )}
          </Card>
        </Col>
      </Row>

      <Card title="关键词云">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 100 }}><Spin /></div>
        ) : (
          <ReactECharts option={wordCloudOption} style={{ height: 450 }} />
        )}
      </Card>
    </div>
  )
}

export default SourceAnalysis
