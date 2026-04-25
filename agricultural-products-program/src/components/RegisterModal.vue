<script setup>
import { ref } from "vue";
import { authAPI } from "../services/api";

const emit = defineEmits(["close", "register-success"]);

const formData = ref({
  username: "",
  email: "",
  password: "",
  name: "",
  phone: "",
});

const loading = ref(false);
const error = ref("");
const emailError = ref("");

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleEmailBlur = () => {
  if (formData.value.email && !validateEmail(formData.value.email)) {
    emailError.value = "请输入有效的邮箱格式";
  } else {
    emailError.value = "";
  }
};

const handleRegister = async () => {
  try {
    loading.value = true;
    error.value = "";
    emailError.value = "";

    // 验证邮箱格式
    if (!validateEmail(formData.value.email)) {
      emailError.value = "请输入有效的邮箱格式";
      return;
    }

    const response = await authAPI.register(formData.value);

    // 保存token和用户信息到本地存储
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    // 触发注册成功事件
    emit("register-success", response.data.user);

    // 关闭模态框
    emit("close");
  } catch (err) {
    error.value = err.response?.data?.message || "注册失败，请检查输入信息";
    console.error("注册错误:", err);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit("close");
};
</script>

<template>
  <div class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>用户注册</h2>
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
        <form @submit.prevent="handleRegister">
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
            <label for="email">邮箱</label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              required
              placeholder="请输入邮箱"
              :class="{ 'input-error': emailError }"
              @blur="handleEmailBlur"
            />
            <span v-if="emailError" class="field-error">{{ emailError }}</span>
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

          <div class="form-group">
            <label for="name">姓名</label>
            <input
              type="text"
              id="name"
              v-model="formData.name"
              required
              placeholder="请输入姓名"
            />
          </div>

          <div class="form-group">
            <label for="phone">手机号</label>
            <input
              type="tel"
              id="phone"
              v-model="formData.phone"
              placeholder="请输入手机号"
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button type="submit" class="register-btn" :disabled="loading">
            {{ loading ? "注册中..." : "注册" }}
          </button>
        </form>
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
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
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

.form-group input.input-error {
  border-color: #f44336;
  background-color: #fff8f8;
}

.form-group input.input-error:focus {
  border-color: #f44336;
  box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.1);
}

.field-error {
  display: block;
  color: #f44336;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
}

.register-btn {
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

.register-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.register-btn:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
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
