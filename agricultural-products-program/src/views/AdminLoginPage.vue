<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authAPI } from "../services/api";

const router = useRouter();

const formData = ref({
  username: "",
  password: "",
});

const registerData = ref({
  username: "",
  email: "",
  password: "",
  name: "",
  phone: "",
  employeeId: "",
});

const loading = ref(false);
const error = ref("");
const showPassword = ref(false);
const isRegisterMode = ref(false);
const registerError = ref("");
const registerSuccess = ref(false);

// 邮箱验证
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleLogin = async () => {
  try {
    loading.value = true;
    error.value = "";

    // 验证输入
    if (!formData.value.username.trim()) {
      error.value = "请输入用户名";
      return;
    }
    if (!formData.value.password) {
      error.value = "请输入密码";
      return;
    }

    const response = await authAPI.login({
      username: formData.value.username,
      password: formData.value.password,
    });

    // 保存token和用户信息到本地存储
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    // 跳转到管理后台首页
    router.push("/admin");
  } catch (err) {
    error.value = err.response?.data?.message || "登录失败，请检查用户名和密码";
    console.error("登录错误:", err);
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  try {
    loading.value = true;
    registerError.value = "";

    // 验证输入
    if (!registerData.value.username.trim()) {
      registerError.value = "请输入用户名";
      return;
    }
    if (!registerData.value.email.trim()) {
      registerError.value = "请输入邮箱";
      return;
    }
    if (!validateEmail(registerData.value.email)) {
      registerError.value = "请输入有效的邮箱格式";
      return;
    }
    if (!registerData.value.employeeId.trim()) {
      registerError.value = "请输入职工号";
      return;
    }
    if (!registerData.value.password) {
      registerError.value = "请输入密码";
      return;
    }
    if (registerData.value.password.length < 6) {
      registerError.value = "密码长度至少6位";
      return;
    }

    // 注册为管理员
    const response = await authAPI.register({
      ...registerData.value,
      role: "admin",
    });

    registerSuccess.value = true;
    // 清空表单
    registerData.value = {
      username: "",
      email: "",
      password: "",
      name: "",
      phone: "",
      employeeId: "",
    };

    // 3秒后切换到登录模式
    setTimeout(() => {
      isRegisterMode.value = false;
      registerSuccess.value = false;
    }, 3000);
  } catch (err) {
    registerError.value = err.response?.data?.message || "注册失败，请稍后重试";
    console.error("注册错误:", err);
  } finally {
    loading.value = false;
  }
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value;
  error.value = "";
  registerError.value = "";
};
</script>

<template>
  <div class="admin-login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>农产品管理系统</h1>
        <p>{{ isRegisterMode ? "管理员注册" : "管理员登录" }}</p>
      </div>

      <!-- 登录表单 -->
      <form
        v-if="!isRegisterMode"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <div class="form-group">
          <label for="username">用户名</label>
          <div class="input-wrapper">
            <svg
              class="input-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <input
              type="text"
              id="username"
              v-model="formData.username"
              placeholder="请输入用户名"
              autocomplete="username"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <div class="input-wrapper">
            <svg
              class="input-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="formData.password"
              placeholder="请输入密码"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="toggle-password"
              @click="togglePassword"
            >
              <svg
                v-if="!showPassword"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              <svg
                v-else
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.94 17.94C16.2306 19.2431 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.98 15.0744C11.579 15.0814 11.1789 15.0072 10.8056 14.8559C10.4322 14.7045 10.0928 14.4793 9.80663 14.1931C9.52046 13.907 9.29524 13.5676 9.14387 13.1943C8.9925 12.8209 8.91827 12.4209 8.92527 12.0199C8.93227 11.619 9.02046 11.2217 9.18442 10.8538C9.34838 10.4858 9.58484 10.1545 9.88 9.88"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="3"
                  y1="3"
                  x2="21"
                  y2="21"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? "登录中..." : "登录" }}
        </button>
      </form>

      <!-- 注册表单 -->
      <form v-else class="login-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="reg-username">用户名</label>
          <div class="input-wrapper">
            <svg
              class="input-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <input
              type="text"
              id="reg-username"
              v-model="registerData.username"
              placeholder="请输入用户名"
              autocomplete="username"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="reg-email">邮箱</label>
          <div class="input-wrapper">
            <svg
              class="input-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="22,6 12,13 2,6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <input
              type="email"
              id="reg-email"
              v-model="registerData.email"
              placeholder="请输入邮箱"
              autocomplete="email"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="reg-name">姓名</label>
          <div class="input-wrapper">
            <svg
              class="input-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <input
              type="text"
              id="reg-name"
              v-model="registerData.name"
              placeholder="请输入姓名（选填）"
              autocomplete="name"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="reg-phone">手机号</label>
          <div class="input-wrapper">
            <svg
              class="input-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49998 10.2412 2.44824 7.27099 2.12 4.2C2.09501 3.92258 2.12824 3.64308 2.2174 3.37921C2.30657 3.11535 2.44998 2.87317 2.63814 2.66789C2.8263 2.46261 3.05539 2.29899 3.31056 2.18734C3.56573 2.0757 3.84137 2.01869 4.12 2.02H7.12C7.54127 2.01493 7.95327 2.14638 8.29549 2.3948C8.6377 2.64321 8.89271 2.99487 9.02 3.4C9.2365 4.07427 9.54767 4.71131 9.94 5.29C10.0911 5.52098 10.1797 5.78583 10.1972 6.05962C10.2146 6.33341 10.1604 6.60685 10.04 6.85H8.55C8.17924 6.85255 7.8278 7.00356 7.57219 7.26623C7.31657 7.52889 7.17913 7.88015 7.19 8.25V8.25C7.19462 9.07942 7.51018 9.87339 8.07324 10.4765C8.6363 11.0795 9.40617 11.4472 10.23 11.5C10.4957 11.5213 10.7539 11.6131 10.9807 11.7669C11.2075 11.9207 11.3948 12.1314 11.5256 12.3798C11.6564 12.6282 11.7263 12.906 11.7286 13.1893C11.7309 13.4725 11.6655 13.7514 11.5387 14.0016C11.4119 14.2518 11.2278 14.4651 11.0037 14.6225C10.7795 14.7799 10.5227 14.8763 10.2561 14.9033C9.98946 14.9302 9.72184 14.8868 9.47748 14.7772C9.23312 14.6676 9.02037 14.4953 8.85838 14.2759C8.6964 14.0564 8.59072 13.7975 8.55121 13.5229C8.5117 13.2484 8.53977 12.9671 8.63273 12.7046C8.72569 12.4421 8.88048 12.2068 9.08283 12.02C9.28517 11.8332 9.52848 11.6907 9.79143 11.6049C10.0544 11.5191 10.329 11.4926 10.59 11.528C10.911 11.5536 11.2266 11.6278 11.524 11.7472C13.0406 12.4082 14.3557 13.4534 15.3374 14.7789C16.3192 16.1044 16.9293 17.659 17.1 19.28C17.1173 19.4723 17.1015 19.6664 17.0533 19.8533C17.0052 20.0401 16.9255 20.2167 16.8178 20.375C16.7101 20.5333 16.5759 20.671 16.4217 20.7821C16.2674 20.8931 16.0956 20.9758 15.9143 21.0262C15.7329 21.0765 15.5449 21.0939 15.3588 21.0775C15.1727 21.0611 14.9914 21.0112 14.8235 20.9299C14.6555 20.8486 14.5036 20.7373 14.3748 20.6011C14.2459 20.465 14.1422 20.3062 14.0687 20.1322C13.9951 19.9582 13.953 19.7719 13.9443 19.5824C13.8696 17.714 13.4555 15.8728 12.7311 14.181C12.6954 14.0915 12.6464 14.0084 12.5862 13.9359C12.526 13.8633 12.4557 13.8026 12.3788 13.7569C12.3019 13.7112 12.2198 13.6812 12.1365 13.6684C12.0532 13.6556 11.97 13.6602 11.8908 13.682C11.7303 13.7172 11.585 13.8102 11.4771 13.9463C11.3691 14.0825 11.3045 14.2539 11.2937 14.4345C11.2829 14.6151 11.3266 14.7947 11.418 14.9485C11.5094 15.1023 11.6435 15.2221 11.8 15.29C11.9503 15.3542 12.0891 15.4428 12.2108 15.5523C12.3325 15.6618 12.4354 15.7906 12.5152 15.933C12.595 16.0755 12.6507 16.2296 12.68 16.3894C12.7093 16.5491 12.7118 16.7122 12.6873 16.8723C12.6629 17.0324 12.6118 17.1873 12.5361 17.3308C12.4604 17.4743 12.3613 17.6044 12.243 17.7158C12.1246 17.8273 11.9887 17.9185 11.8408 17.9856C11.6929 18.0527 11.5352 18.0946 11.3742 18.1095C11.2133 18.1243 11.0515 18.1118 10.8958 18.0726C10.7401 18.0334 10.5929 17.9681 10.4606 17.8793C10.3282 17.7906 10.2127 17.6799 10.1195 17.552C9.7664 17.0998 9.50964 16.5821 9.36338 16.0299C9.21713 15.4778 9.18474 14.9027 9.26842 14.3388C9.35211 13.7749 9.5501 13.2338 9.8499 12.7489C10.1497 12.264 10.5451 11.8451 11.0128 11.5173C13.3262 9.87507 16.1642 9.15545 18.9431 9.52534C21.722 9.89524 24.1974 11.3247 25.8514 13.4736C27.5054 15.6226 28.1967 18.3173 27.7673 20.9548C27.3379 23.5922 25.8283 25.9282 23.5979 27.4345C21.3675 28.9407 18.6091 29.4879 15.9277 28.9437C13.2464 28.3995 10.8617 26.8114 9.32126 24.5342C8.95648 23.9588 8.67116 23.336 8.47191 22.6825C8.27267 22.0291 8.16135 21.3514 8.14098 20.6685C8.12061 19.9857 8.19144 19.3039 8.35155 18.6418C8.51165 17.9796 8.75954 17.3435 9.08869 16.75"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <input
              type="tel"
              id="reg-phone"
              v-model="registerData.phone"
              placeholder="请输入手机号（选填）"
              autocomplete="tel"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="reg-employeeId">职工号</label>
          <div class="input-wrapper">
            <svg
              class="input-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="2"
                y="7"
                width="20"
                height="14"
                rx="2"
                ry="2"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M12 12V16M12 12H8M12 12H16"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <input
              type="text"
              id="reg-employeeId"
              v-model="registerData.employeeId"
              placeholder="请输入职工号（必填）"
              autocomplete="off"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="reg-password">密码</label>
          <div class="input-wrapper">
            <svg
              class="input-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="reg-password"
              v-model="registerData.password"
              placeholder="请输入密码（至少6位）"
              autocomplete="new-password"
            />
          </div>
        </div>

        <div v-if="registerError" class="error-message">
          {{ registerError }}
        </div>

        <div v-if="registerSuccess" class="success-message">
          注册成功！请登录
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? "注册中..." : "注册" }}
        </button>
      </form>

      <div class="login-footer">
        <p v-if="!isRegisterMode">
          还没有账号？<button
            type="button"
            class="link-btn"
            @click="toggleMode"
          >
            立即注册
          </button>
        </p>
        <p v-else>
          已有账号？<button type="button" class="link-btn" @click="toggleMode">
            立即登录
          </button>
        </p>
        <p class="back-home">返回 <router-link to="/">商城首页</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.login-header p {
  font-size: 14px;
  color: #666;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #999;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.toggle-password {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0;
}

.toggle-password:hover {
  color: #667eea;
}

.error-message {
  padding: 12px 16px;
  background-color: #fff2f2;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  color: #f44336;
  font-size: 14px;
  text-align: center;
}

.success-message {
  padding: 12px 16px;
  background-color: #e8f5e9;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
  color: #4caf50;
  font-size: 14px;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
}

.login-footer p {
  font-size: 14px;
  color: #666;
}

.login-footer .link-btn {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
}

.login-footer .link-btn:hover {
  text-decoration: underline;
}

.login-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-container {
    margin: 20px;
    padding: 30px 24px;
  }

  .login-header h1 {
    font-size: 24px;
  }
}
</style>
