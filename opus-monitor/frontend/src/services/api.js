import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.code === 0) {
      return data.data
    }
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    const message = error.response?.data?.message || error.message || '网络错误'
    return Promise.reject(new Error(message))
  }
)

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data)
}

export const newsApi = {
  getList: (params) => api.get('/news', { params }),
  getDetail: (id) => api.get(`/news/${id}`),
  delete: (id) => api.delete(`/news/${id}`),
  getStatistics: () => api.get('/news/statistics')
}

export const keywordApi = {
  getList: (params) => api.get('/keywords', { params }),
  create: (data) => api.post('/keywords', data),
  update: (id, data) => api.put(`/keywords/${id}`, data),
  delete: (id) => api.delete(`/keywords/${id}`)
}

export const sourceApi = {
  getList: () => api.get('/sources'),
  create: (data) => api.post('/sources', data),
  update: (id, data) => api.put(`/sources/${id}`, data),
  delete: (id) => api.delete(`/sources/${id}`)
}

export const crawlApi = {
  trigger: (sourceId) => api.post('/crawl/trigger', { sourceId }),
  getTasks: (params) => api.get('/crawl/tasks', { params }),
  getTaskDetail: (id) => api.get(`/crawl/tasks/${id}`)
}

export const analysisApi = {
  getSentimentTrend: (params) => api.get('/analysis/sentiment-trend', { params }),
  getHeatRanking: (params) => api.get('/analysis/heat-ranking', { params }),
  getSourceDistribution: () => api.get('/analysis/source-distribution'),
  getWordCloud: () => api.get('/analysis/word-cloud'),
  getCategoryStats: () => api.get('/analysis/category-stats')
}

export const userApi = {
  getList: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
}

export default api
