import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd'
import {
  DashboardOutlined,
  MonitorOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
  CaretDownOutlined,
  FireOutlined
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const getSelectedKeys = () => {
    const path = location.pathname
    if (path.startsWith('/dashboard')) return ['/dashboard']
    if (path.startsWith('/monitor')) return ['/monitor']
    if (path.startsWith('/analysis')) return ['/analysis']
    if (path.startsWith('/system')) return ['/system']
    if (path.startsWith('/profile')) return ['/profile']
    return []
  }

  const getOpenKeys = () => {
    const path = location.pathname
    if (path.startsWith('/monitor')) return ['/monitor']
    if (path.startsWith('/analysis')) return ['/analysis']
    if (path.startsWith('/system')) return ['/system']
    return []
  }

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/dashboard')
    },
    {
      key: '/monitor',
      icon: <MonitorOutlined />,
      label: '舆情监控',
      children: [
        { key: '/monitor/news', label: '新闻列表', onClick: () => navigate('/monitor/news') },
        { key: '/monitor/keywords', label: '关键词管理', onClick: () => navigate('/monitor/keywords') }
      ]
    },
    {
      key: '/analysis',
      icon: <BarChartOutlined />,
      label: '数据分析',
      children: [
        { key: '/analysis/sentiment', label: '情感分析', onClick: () => navigate('/analysis/sentiment') },
        { key: '/analysis/heat', label: '热度分析', onClick: () => navigate('/analysis/heat') },
        { key: '/analysis/source', label: '来源分析', onClick: () => navigate('/analysis/source') }
      ]
    },
    hasRole('admin') && {
      key: '/system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        { key: '/system/users', label: '用户管理', onClick: () => navigate('/system/users') },
        { key: '/system/sources', label: '新闻源管理', onClick: () => navigate('/system/sources') },
        { key: '/system/tasks', label: '采集任务', onClick: () => navigate('/system/tasks') }
      ]
    }
  ].filter(Boolean)

  const userMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile')
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout()
        navigate('/login')
      }
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <FireOutlined style={{ marginRight: collapsed ? 0 : 8, color: '#faad14' }} />
          {!collapsed && '舆情感知系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)'
        }}>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} src={user?.avatar} />
              <Space direction="vertical" size={0}>
                <Text strong>{user?.username}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {user?.role === 'admin' ? '管理员' : user?.role === 'analyst' ? '分析师' : '访客'}
                </Text>
              </Space>
              <CaretDownOutlined style={{ fontSize: 12 }} />
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
