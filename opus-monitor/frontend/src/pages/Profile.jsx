import { useState } from 'react'
import {
  Card, Form, Input, Button, message, Tabs, Avatar, Descriptions, Tag, Space
} from 'antd'
import { UserOutlined, EditOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'
import { formatTime, roleText, roleColor, statusText, statusColor } from '../utils'

const { TabPane } = Tabs

const Profile = () => {
  const { user, setUser } = useAuth()
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleUpdateProfile = async () => {
    try {
      const values = await profileForm.validateFields()
      setProfileLoading(true)
      const updated = await authApi.updateProfile(values)
      setUser(updated)
      message.success('个人信息更新成功')
    } catch (err) {
      if (err.errorFields) return
      message.error(err.message)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    try {
      const values = await passwordForm.validateFields()
      setPasswordLoading(true)
      await authApi.updatePassword(values)
      message.success('密码修改成功')
      passwordForm.resetFields()
    } catch (err) {
      if (err.errorFields) return
      message.error(err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' }}>
          <Avatar size={80} icon={<UserOutlined />} src={user?.avatar} />
          <div style={{ marginLeft: 24 }}>
            <h2 style={{ marginBottom: 8 }}>{user?.username}</h2>
            <Space>
              <Tag color={roleColor[user?.role]}>{roleText[user?.role]}</Tag>
              <Tag color={statusColor[user?.status]}>{statusText[user?.status]}</Tag>
            </Space>
          </div>
        </div>

        <Descriptions column={2} size="small" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="注册时间">{formatTime(user?.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="最后登录">{formatTime(user?.lastLoginAt)}</Descriptions.Item>
        </Descriptions>

        <Tabs defaultActiveKey="profile">
          <TabPane
            tab={
              <span>
                <EditOutlined />
                修改信息
              </span>
            }
            key="profile"
          >
            <Form
              form={profileForm}
              layout="vertical"
              initialValues={{ email: user?.email, avatar: user?.avatar }}
              style={{ maxWidth: 400 }}
            >
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '邮箱格式不正确' }
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
              <Form.Item name="avatar" label="头像URL">
                <Input placeholder="头像图片地址（可选）" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handleUpdateProfile} loading={profileLoading}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <LockOutlined />
                修改密码
              </span>
            }
            key="password"
          >
            <Form
              form={passwordForm}
              layout="vertical"
              style={{ maxWidth: 400 }}
            >
              <Form.Item
                name="oldPassword"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password placeholder="请输入当前密码" />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少6位' }
                ]}
              >
                <Input.Password placeholder="请输入新密码" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    }
                  })
                ]}
              >
                <Input.Password placeholder="请再次输入新密码" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handleUpdatePassword} loading={passwordLoading}>
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default Profile
