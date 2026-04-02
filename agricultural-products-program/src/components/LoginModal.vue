<script setup>
import { ref } from "vue";
import { authAPI } from "../services/api";
import RegisterModal from "./RegisterModal.vue";

const emit = defineEmits(["close", "login-success"]);

const formData = ref({
  username: "",
  password: "",
});

const loading = ref(false);
const error = ref("");
const showRegisterModal = ref(false);

const handleLogin = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await authAPI.login(formData.value);

    // 保存token和用户信息到本地存储
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    // 触发登录成功事件
    emit("login-success", response.data.user);

    // 关闭模态框
    emit("close");
  } catch (err) {
    error.value = err.response?.data?.message || "登录失败，请检查用户名和密码";
    console.error("登录错误:", err);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit("close");
};

const handleRegister = () => {
  // 打开注册模态框
  showRegisterModal.value = true;
};

const handleAdminLogin = () => {
  // 直接跳转到管理员后台页面
  window.location.href = "/admin";
};
</script>

<template>
  <div class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>用户登录</h2>
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
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              type="text"
              id="username"
              v-model="formData.username"
              required
              placeholder="请输入用户名"
            />
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              required
              placeholder="请输入密码"
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? "登录中..." : "登录" }}
          </button>

          <div class="login-actions">
            <button type="button" class="register-btn" @click="handleRegister">
              用户注册
            </button>
            <button
              type="button"
              class="admin-login-btn"
              @click="handleAdminLogin"
            >
              进入管理后台
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- 注册模态框 -->
  <RegisterModal v-if="showRegisterModal" @close="showRegisterModal = false" />
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

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.login-btn:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.login-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.register-btn {
  background: none;
  border: none;
  color: #4caf50;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.3s;
}

.register-btn:hover {
  color: #45a049;
  text-decoration: underline;
}

.admin-login-btn {
  background: none;
  border: none;
  color: #4caf50;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.3s;
}

.admin-login-btn:hover {
  color: #45a049;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .modal-container {
    margin: 0 1rem;
  }

  .modal-header,
  .modal-body {
    padding: 1.25rem;
  }
}
</style>
