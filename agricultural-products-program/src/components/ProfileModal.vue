<script setup>
import { ref, onMounted } from "vue";
import { authAPI } from "../services/api";

const emit = defineEmits(["close", "logout"]);

const user = ref(null);
const loading = ref(false);
const error = ref("");
const showPersonalInfo = ref(false);

const fetchUserProfile = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await authAPI.getProfile();
    user.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || "获取个人信息失败";
    console.error("获取个人信息错误:", err);
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  // 清除本地存储
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // 触发退出登录事件
  emit("logout");

  // 关闭模态框
  emit("close");
};

const handleClose = () => {
  emit("close");
};

onMounted(() => {
  fetchUserProfile();
});
</script>

<template>
  <div class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>个人中心</h2>
        <button class="close-btn" @click="handleClose">
          <svg
            width="24"
            height="24"
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
        <div v-if="loading" class="loading">加载中...</div>

        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-else-if="user" class="profile-content">
          <div
            class="profile-header"
            @click="showPersonalInfo = !showPersonalInfo"
          >
            <div class="avatar">
              {{ user.name.charAt(0) }}
            </div>
            <div class="user-info">
              <h3>{{ user.name }}</h3>
              <p>{{ user.username }}</p>
            </div>
            <span class="toggle-icon">{{ showPersonalInfo ? "▼" : "▶" }}</span>
          </div>

          <!-- 个人信息区域 -->
          <div class="profile-details" v-if="showPersonalInfo">
            <div class="detail-item">
              <span class="label">邮箱:</span>
              <span class="value">{{ user.email }}</span>
            </div>
            <div class="detail-item">
              <span class="label">手机号:</span>
              <span class="value">{{ user.phone || "未设置" }}</span>
            </div>
            <div class="detail-item">
              <span class="label">角色:</span>
              <span class="value">{{
                user.role === "admin" ? "管理员" : "普通用户"
              }}</span>
            </div>
          </div>

          <!-- 订单状态区域 -->
          <div class="order-status-section">
            <h3>订单状态</h3>
            <div class="order-status-grid">
              <div class="status-item">
                <div class="status-icon">📦</div>
                <div class="status-text">待收货</div>
              </div>
              <div class="status-item">
                <div class="status-icon">💳</div>
                <div class="status-text">待付款</div>
              </div>
              <div class="status-item">
                <div class="status-icon">⭐</div>
                <div class="status-text">待评价</div>
              </div>
              <div class="status-item">
                <div class="status-icon">🔄</div>
                <div class="status-text">售后/退货</div>
              </div>
            </div>
          </div>

          <!-- 个人功能区域 -->
          <div class="personal-section">
            <h3>个人中心</h3>
            <div class="personal-grid">
              <div class="personal-item">
                <div class="personal-text">我的订单</div>
              </div>
              <div class="personal-item">
                <div class="personal-text">我的收藏</div>
              </div>
              <div class="personal-item">
                <div class="personal-text">我的足迹</div>
              </div>
              <div class="personal-item">
                <div class="personal-text">关注店铺</div>
              </div>
            </div>
          </div>

          <button class="logout-btn" @click="handleLogout">退出登录</button>
        </div>

        <div v-else class="empty-state">
          <p>未获取到用户信息</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
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

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.3s;
}

.profile-header:hover {
  background-color: #f9f9f9;
}

.toggle-icon {
  font-size: 0.75rem;
  color: #666;
  transition: transform 0.3s;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.detail-item .label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;
}

.detail-item .value {
  font-size: 0.875rem;
  color: #333;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #4caf50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
}

.user-info h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
}

.user-info p {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #666;
}

.order-status-section,
.personal-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.order-status-section h3,
.personal-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.order-status-grid,
.personal-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.status-item,
.personal-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.status-item:hover,
.personal-item:hover {
  background-color: #f0f0f0;
}

.status-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.status-text,
.personal-text {
  font-size: 0.875rem;
  color: #333;
  text-align: center;
}

.logout-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1.5rem;
}

.logout-btn:hover {
  background-color: #d32f2f;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

@media (max-width: 480px) {
  .modal-container {
    margin: 0 1rem;
  }

  .modal-header,
  .modal-body {
    padding: 1.25rem;
  }

  .order-status-grid,
  .personal-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .status-item,
  .personal-item {
    padding: 0.75rem;
  }

  .status-icon {
    font-size: 1.25rem;
  }

  .status-text,
  .personal-text {
    font-size: 0.75rem;
  }
}
</style>
