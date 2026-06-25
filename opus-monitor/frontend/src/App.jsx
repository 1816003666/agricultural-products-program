import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import NewsList from './pages/monitor/NewsList'
import KeywordManage from './pages/monitor/KeywordManage'
import SentimentAnalysis from './pages/analysis/SentimentAnalysis'
import HeatAnalysis from './pages/analysis/HeatAnalysis'
import SourceAnalysis from './pages/analysis/SourceAnalysis'
import UserManage from './pages/system/UserManage'
import SourceManage from './pages/system/SourceManage'
import TaskManage from './pages/system/TaskManage'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="monitor/news" element={<NewsList />} />
          <Route path="monitor/keywords" element={<KeywordManage />} />
          <Route path="analysis/sentiment" element={<SentimentAnalysis />} />
          <Route path="analysis/heat" element={<HeatAnalysis />} />
          <Route path="analysis/source" element={<SourceAnalysis />} />
          <Route path="system/users" element={<UserManage />} />
          <Route path="system/sources" element={<SourceManage />} />
          <Route path="system/tasks" element={<TaskManage />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
