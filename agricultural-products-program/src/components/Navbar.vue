<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { authAPI, orderAPI, userAPI } from "../services/api";
import LoginModal from "./LoginModal.vue";
import RegisterModal from "./RegisterModal.vue";
import ProfileModal from "./ProfileModal.vue";

const props = defineProps({
  cartCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["open-cart", "search"]);

const searchQuery = ref("");
const showUserMenu = ref(false);
const user = ref(null);
const showLoginModal = ref(false);
const showRegisterModal = ref(false);
const showProfileModal = ref(false);

const categories = [
  { name: "水果", id: "fruit", anchor: "#fresh-fruits" },
  { name: "蔬菜", id: "vegetable", anchor: "#fresh-vegetables" },
  { name: "肉禽蛋", id: "meat", anchor: "#meat-products" },
  { name: "水产", id: "seafood", anchor: "#seafood-products" },
  { name: "粮油", id: "grain", anchor: "#grain-products" },
  { name: "干货", id: "dry", anchor: "#dry-products" },
];

const userMenuItems = computed(() => {
  if (user.value) {
    return [
      { name: "个人中心", id: "profile" },
      { name: "退出登录", id: "logout" },
    ];
  } else {
    return [
      { name: "登录", id: "login" },
      { name: "注册", id: "register" },
    ];
  }
});

const handleSearch = () => {
  emit("search", searchQuery.value);
  console.log("搜索:", searchQuery.value);
};

const handleCartClick = () => {
  // 检查用户是否登录
  const token = localStorage.getItem("token");
  if (!token) {
    alert("请先登录");
    return;
  }
  emit("open-cart");
};

const handleUserClick = () => {
  const token = localStorage.getItem("token");
  if (token) {
    // 已登录，直接跳转到个人中心
    window.location.href = "/profile";
  } else {
    // 未登录，弹出登录窗口
    showLoginModal.value = true;
  }
};

const handleMenuItemClick = async (itemId) => {
  console.log("点击菜单项:", itemId);
  showUserMenu.value = false;

  try {
    switch (itemId) {
      case "login":
        showLoginModal.value = true;
        break;
      case "register":
        showRegisterModal.value = true;
        break;
      case "logout":
        // 退出登录
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        user.value = null;
        console.log("退出登录成功");
        break;
      case "profile":
        // 跳转到个人中心页面
        window.location.href = "/profile";
        break;
    }
  } catch (error) {
    console.error("操作失败:", error);
    // 处理未登录的情况
    if (error.response && error.response.status === 401) {
      console.log("请先登录");
      showLoginModal.value = true;
    }
  }
};

// 处理登录成功
const handleLoginSuccess = (userData) => {
  user.value = userData;
  console.log("登录成功:", userData);
};

// 处理注册成功
const handleRegisterSuccess = (userData) => {
  user.value = userData;
  console.log("注册成功:", userData);
};

// 处理退出登录
const handleLogout = () => {
  user.value = null;
  console.log("退出登录成功");
};

// 检查用户登录状态
const checkUserStatus = () => {
  const userData = localStorage.getItem("user");
  if (userData) {
    user.value = JSON.parse(userData);
  }
};

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (
    !event.target.closest(".user-icon") &&
    !event.target.closest(".user-menu")
  ) {
    showUserMenu.value = false;
  }
};

// 添加全局点击事件监听器
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  checkUserStatus();
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-brand">
        <h1>
          <a href="/" style="text-decoration: none; color: inherit"
            >农产品直销</a
          >
        </h1>
      </div>

      <div class="navbar-menu">
        <ul class="menu-list">
          <li v-for="category in categories" :key="category.id">
            <a :href="category.anchor" class="menu-item">{{ category.name }}</a>
          </li>
        </ul>
      </div>

      <div class="navbar-right">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索农产品..."
            class="search-input"
          />
          <button @click="handleSearch" class="search-btn">搜索</button>
        </div>

        <div class="cart-icon" @click="handleCartClick">
          <span class="cart-count">{{ props.cartCount }}</span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 18C7 19.1046 6.10457 20 5 20C3.89543 20 3 19.1046 3 18C3 16.8954 3.89543 16 5 16C6.10457 16 7 16.8954 7 18Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M17 18C17 19.1046 16.1046 20 15 20C13.8954 20 13 19.1046 13 18C13 16.8954 13.8954 16 15 16C16.1046 16 17 16.8954 17 18Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3 6H21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M16 6V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M15 12H9"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <div class="user-icon" @click="handleUserClick">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 21V19C19 17.9391 18.5786 16.9217 17.8284 16.1716C17.0783 15.4214 16.0609 15 15 15H9C7.93913 15 6.92172 15.4214 6.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21"
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
        </div>
      </div>
    </div>
  </nav>

  <!-- 登录模态框 -->
  <LoginModal
    v-if="showLoginModal"
    @close="showLoginModal = false"
    @login-success="handleLoginSuccess"
  />

  <!-- 注册模态框 -->
  <RegisterModal
    v-if="showRegisterModal"
    @close="showRegisterModal = false"
    @register-success="handleRegisterSuccess"
  />

  <!-- 个人中心模态框 -->
  <ProfileModal
    v-if="showProfileModal"
    @close="showProfileModal = false"
    @logout="handleLogout"
  />
</template>

<style scoped>
.navbar {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  box-sizing: border-box;
}

.container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.navbar-brand h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4caf50;
  margin: 0;
}

.navbar-menu {
  flex: 1;
  margin: 0 2rem;
}

.menu-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.menu-item {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
  white-space: nowrap;
}

.menu-item:hover {
  color: #4caf50;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.search-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
  min-width: 150px;
  flex: 1;
}

.search-btn {
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.search-btn:hover {
  background-color: #45a049;
}

.cart-icon,
.user-icon {
  position: relative;
  cursor: pointer;
  color: #333;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.cart-icon:hover,
.user-icon:hover {
  color: #4caf50;
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 180px;
  z-index: 1001;
  overflow: hidden;
}

.user-menu-list {
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
}

.user-menu-list li {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-menu-list li:hover {
  background-color: #f5f5f5;
}

.menu-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.menu-text {
  font-size: 0.875rem;
  color: #333;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1024px) {
  .navbar-menu {
    margin: 0 1rem;
  }

  .menu-list {
    gap: 1rem;
  }

  .search-input {
    width: 180px;
  }
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    gap: 1rem;
    padding: 0 0.75rem;
  }

  .navbar-brand h1 {
    font-size: 1.25rem;
  }

  .navbar-menu {
    width: 100%;
    margin: 0;
  }

  .menu-list {
    gap: 0.75rem;
  }

  .menu-item {
    font-size: 0.875rem;
  }

  .navbar-right {
    width: 100%;
    justify-content: center;
  }

  .search-input {
    width: 150px;
  }

  .search-btn {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0.75rem 0;
  }

  .container {
    gap: 0.75rem;
    padding: 0 0.5rem;
  }

  .menu-list {
    gap: 0.5rem;
  }

  .menu-item {
    font-size: 0.75rem;
  }

  .navbar-right {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    width: 100%;
  }

  .search-input {
    flex: 1;
    min-width: 0;
  }

  .cart-icon,
  .user-icon {
    width: 36px;
    height: 36px;
  }
}
</style>
