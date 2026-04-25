<script setup>
import { ref, onMounted } from "vue";
import { userAPI } from "../services/api";

const users = ref([]);
const loading = ref(false);
const error = ref("");
const showDetailModal = ref(false);
const currentUser = ref(null);

const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await userAPI.getUsers();
    users.value = response.data;
  } catch (err) {
    error.value = "获取用户列表失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchUserDetail = async (userId) => {
  try {
    loading.value = true;
    const response = await userAPI.getUserById(userId);
    currentUser.value = response.data;
    showDetailModal.value = true;
  } catch (err) {
    error.value = "获取用户详情失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleUserStatusUpdate = async (userId, status) => {
  try {
    loading.value = true;
    await userAPI.updateUserStatus(userId, { status });
    await fetchUsers();
  } catch (err) {
    error.value = "更新用户状态失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleDeleteUser = async (userId) => {
  if (confirm("确定要删除这个用户吗？")) {
    try {
      loading.value = true;
      await userAPI.deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      error.value = "删除用户失败";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }
};

onMounted(async () => {
  await fetchUsers();
});
</script>

<template>
  <div class="main-content">
    <div class="header">
      <h2>用户管理</h2>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="user-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>姓名</th>
            <th>电话</th>
            <th>角色</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.phone }}</td>
            <td>
              <span :class="['role-badge', user.role]">
                {{ user.role }}
              </span>
            </td>
            <td>
              <button class="detail-btn" @click="fetchUserDetail(user.id)">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <line
                    x1="12"
                    y1="8"
                    x2="12"
                    y2="12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <line
                    x1="12"
                    y1="16"
                    x2="12.01"
                    y2="16"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <button class="delete-btn" @click="handleDeleteUser(user.id)">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline
                    points="3 6 5 6 21 6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 用户详情模态框 -->
    <div
      v-if="showDetailModal"
      class="modal-overlay"
      @click="showDetailModal = false"
    >
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>用户详情</h3>
          <button class="close-btn" @click="showDetailModal = false">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="user-info">
            <div class="info-row">
              <span class="label">ID:</span>
              <span class="value">{{ currentUser?.id }}</span>
            </div>
            <div class="info-row">
              <span class="label">用户名:</span>
              <span class="value">{{ currentUser?.username }}</span>
            </div>
            <div class="info-row">
              <span class="label">邮箱:</span>
              <span class="value">{{ currentUser?.email }}</span>
            </div>
            <div class="info-row">
              <span class="label">姓名:</span>
              <span class="value">{{ currentUser?.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">电话:</span>
              <span class="value">{{ currentUser?.phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">角色:</span>
              <span :class="['role-badge', currentUser?.role]">{{
                currentUser?.role
              }}</span>
            </div>
            <div class="info-row" v-if="currentUser?.employeeId">
              <span class="label">职工号:</span>
              <span class="value">{{ currentUser?.employeeId }}</span>
            </div>
            <div class="info-row">
              <span class="label">创建时间:</span>
              <span class="value">{{ currentUser?.created_at }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button class="close-modal-btn" @click="showDetailModal = false">
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.header {
  margin-bottom: 2rem;
}

.header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.user-table {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.user-table table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.user-table th {
  background-color: #f9f9f9;
  font-weight: 600;
  color: #666;
}

.user-table td {
  color: #333;
}

.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-badge.user {
  background-color: #cce7ff;
  color: #004085;
}

.role-badge.admin {
  background-color: #d4edda;
  color: #155724;
}

.detail-btn,
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.detail-btn {
  color: #4caf50;
  margin-right: 0.5rem;
}

.delete-btn {
  color: #f44336;
}

.detail-btn:hover {
  background-color: rgba(76, 175, 80, 0.1);
}

.delete-btn:hover {
  background-color: rgba(244, 67, 54, 0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.user-info {
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  margin-bottom: 0.75rem;
}

.info-row .label {
  width: 100px;
  font-weight: 500;
  color: #666;
}

.info-row .value {
  flex: 1;
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.close-modal-btn {
  padding: 0.75rem 1.5rem;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.close-modal-btn:hover {
  background-color: #e0e0e0;
}

@media (max-width: 500px) {
  .user-table {
    overflow-x: auto;
  }

  .modal-container {
    margin: 0 1rem;
  }

  .info-row {
    flex-direction: column;
  }

  .info-row .label {
    width: auto;
    margin-bottom: 0.25rem;
  }
}
</style>
