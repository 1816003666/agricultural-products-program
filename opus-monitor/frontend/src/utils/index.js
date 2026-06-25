import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export const formatTime = (time, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) return '-'
  return dayjs(time).format(format)
}

export const formatRelativeTime = (time) => {
  if (!time) return '-'
  return dayjs(time).fromNow()
}

export const formatDate = (date) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

export const sentimentText = {
  positive: '正面',
  negative: '负面',
  neutral: '中性'
}

export const sentimentColor = {
  positive: '#52c41a',
  negative: '#ff4d4f',
  neutral: '#faad14'
}

export const roleText = {
  admin: '管理员',
  analyst: '分析师',
  viewer: '访客'
}

export const roleColor = {
  admin: 'red',
  analyst: 'blue',
  viewer: 'default'
}

export const statusText = {
  active: '启用',
  inactive: '禁用',
  disabled: '禁用',
  pending: '待执行',
  running: '执行中',
  completed: '已完成',
  failed: '失败'
}

export const statusColor = {
  active: 'green',
  inactive: 'default',
  disabled: 'red',
  pending: 'default',
  running: 'processing',
  completed: 'success',
  failed: 'error'
}

export const categoryList = ['政治', '经济', '科技', '社会', '娱乐', '体育', '其他']

export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
