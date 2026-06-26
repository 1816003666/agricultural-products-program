import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'
import { App } from 'antd'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)

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
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const showMessage = useCallback((type, content) => {
    setMessage({ type, content })
    setTimeout(() => setMessage(null), 3000)
  }, [])

  const login = async (username, password) => {
    const data = await authApi.login({ username, password })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  const register = async (userData) => {
    const data = await authApi.register(userData)
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
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
      setUser,
      showMessage
    }}>
      <App message={{ maxCount: 1 }}>
        {children}
      </App>
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
