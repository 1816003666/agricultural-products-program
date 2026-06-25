import { createContext, useContext, useState, useEffect } from 'react'
import { message } from 'antd'
import { authApi } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      loadProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const loadProfile = async () => {
    try {
      const profile = await authApi.getProfile()
      setUser(profile)
    } catch (err) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    const data = await authApi.login({ username, password })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    message.success('登录成功')
    return data
  }

  const register = async (userData) => {
    const data = await authApi.register(userData)
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    message.success('注册成功')
    return data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const hasRole = (...roles) => {
    if (!user) return false
    const roleHierarchy = {
      admin: ['admin', 'analyst', 'viewer'],
      analyst: ['analyst', 'viewer'],
      viewer: ['viewer']
    }
    return roles.some(role => roleHierarchy[user.role]?.includes(role))
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      hasRole,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
