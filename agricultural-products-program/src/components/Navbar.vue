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
const showMobileMenu = ref(false);

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};



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

const categories = [
  { name: "水果", id: "fruit", icon: "🍎", href: "/category/fruit" },
  { name: "蔬菜", id: "vegetable", icon: "🥬", href: "/category/vegetable" },
  { name: "肉禽蛋", id: "meat", icon: "🥩", href: "/category/meat" },
  { name: "水产", id: "seafood", icon: "🐟", href: "/category/seafood" },
  { name: "粮油", id: "grain", icon: "🌾", href: "/category/grain" },
  { name: "干货", id: "dry", icon: "🌰", href: "/category/dry" },
];

const handleSearch = () => {
  emit("search", searchQuery.value);
  console.log("搜索:", searchQuery.value);
};

const handleSearchClick = () => {
  window.location.href = "/search";
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

const handleCustomerService = () => {
  // 客服功能
  alert("客服热线：400-123-4567\n工作时间：9:00-18:00");
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
          <a href="/" style="text-decoration: none; color: inherit">
            农产品直销
          </a>
        </h1>
      </div>

      <!-- 移动端菜单按钮 -->
      <div class="mobile-menu-btn" @click="toggleMobileMenu">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 12H21"
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
            d="M3 18H21"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- 桌面端导航菜单 -->
      <div class="navbar-menu">
        <ul class="menu-list">


        </ul>
      </div>

      <!-- 移动端导航菜单 -->
      <div class="mobile-menu" v-if="showMobileMenu">
        <ul class="mobile-menu-list">
          <li v-for="category in categories" :key="category.id">
            <a :href="category.href" class="mobile-menu-item" @click="showMobileMenu = false">
              <span class="mobile-menu-icon">{{ category.icon }}</span>
              <span class="mobile-menu-text">{{ category.name }}</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="navbar-right">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索草莓、春笋、土鸡蛋..."
            class="search-input"
          />
          <button @click="handleSearch" class="search-btn">搜索</button>
        </div>

        <div class="icons-container">
          <div class="nav-icon" @click="handleSearchClick">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M21 21L16.65 16.65"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <span class="nav-text">搜索</span>
          </div>

          <div class="nav-icon" @click="handleCartClick">
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
            <span class="nav-text">购物车</span>
          </div>

          <div class="nav-icon" @click="handleUserClick">
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
            <span class="nav-text">我的</span>
          </div>

          <div class="nav-icon" @click="handleCustomerService">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="nav-text">客服</span>
          </div>
        </div>
      </div>
    </div>
  </nav>
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

.mobile-menu-btn {
  display: none;
  cursor: pointer;
  color: #333;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu-btn:hover {
  background-color: rgba(46, 172, 112, 0.1);
}

.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 999;
  border-top: 1px solid #eee;
}

.mobile-menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: #333;
  transition: all 0.3s;
  border-bottom: 1px solid #f5f5f5;
}

.mobile-menu-item:hover {
  background-color: rgba(46, 172, 112, 0.1);
  color: #2eac70;
}

.mobile-menu-icon {
  font-size: 1.25rem;
}

.mobile-menu-text {
  font-size: 0.9375rem;
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
  flex-wrap: wrap;
  gap: 1rem;
}

.navbar-brand h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2eac70;
  margin: 0;
}

.navbar-menu {
  flex: 1;
  margin: 0 1rem;
  min-width: 0;
}

.menu-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.menu-item {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s;
  flex-shrink: 0;
}

.menu-item:hover {
  color: #2eac70;
  background-color: rgba(46, 172, 112, 0.1);
}

.menu-icon {
  font-size: 1.2rem;
}

.menu-text {
  font-size: 1rem;
}

.hot-tag {
  background-color: #ff6b35;
  color: white;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-weight: bold;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  min-width: 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 25px;
  width: 100%;
  min-width: 150px;
  flex: 1;
  font-size: 1rem;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #2eac70;
  box-shadow: 0 0 0 3px rgba(46, 172, 112, 0.1);
}

.search-btn {
  padding: 0.75rem 1.5rem;
  background-color: #2eac70;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(46, 172, 112, 0.3);
  flex-shrink: 0;
}

.search-btn:hover {
  background-color: #289e63;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(46, 172, 112, 0.4);
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

.icons-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.nav-icon {
  position: relative;
  cursor: pointer;
  color: #333;
  transition: color 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s;
}

.nav-icon:hover {
  color: #2eac70;
  background-color: rgba(46, 172, 112, 0.1);
}

.nav-text {
  font-size: 0.75rem;
  white-space: nowrap;
}

.cart-icon:hover,
.user-icon:hover {
  color: #2eac70;
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
  background-color: #ff6b35;
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

@media (max-width: 500px) {
  .container {
    flex-direction: row;
    gap: 0.5rem;
    padding: 0 0.75rem;
    align-items: center;
    flex-wrap: nowrap;
    justify-content: space-between;
  }

  .mobile-menu-btn {
    display: block;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
  }

  .navbar-menu {
    display: none;
  }

  .navbar-brand h1 {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .navbar-right {
    flex: 0 0 auto;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .search-box {
    display: none;
  }

  .icons-container {
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .nav-text {
    display: none;
  }

  .nav-icon {
    padding: 0.25rem;
    flex-shrink: 0;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0.5rem 0;
  }

  .container {
    gap: 0.375rem;
    padding: 0 0.5rem;
    flex-wrap: nowrap;
    justify-content: space-between;
  }

  .navbar-brand {
    flex: 0 0 auto;
  }

  .navbar-brand h1 {
    font-size: 0.9375rem;
    white-space: nowrap;
  }

  .mobile-menu-btn {
    flex-shrink: 0;
    margin-right: 0.25rem;
    align-items: center;
    justify-content: center;
  }

  .navbar-right {
    width: auto;
    order: 0;
    margin-top: 0;
    flex: 1;
    justify-content: flex-end;
    gap: 0.25rem;
  }

  .search-box {
    display: none;
  }

  .icons-container {
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .nav-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .nav-icon svg {
    width: 18px;
    height: 18px;
  }
}
</style>
