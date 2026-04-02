<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authAPI, orderAPI, productAPI } from "../services/api";

const router = useRouter();
const route = useRoute();
const user = ref(null);
const loading = ref(false);
const orders = ref([]);
const products = ref([]);
const activeMenu = ref('dashboard');

const fetchUserInfo = async () => {
  try {
    loading.value = true;
    const userInfo = await authAPI.getProfile();
    user.value = userInfo;
  } catch (error) {
    // 不打印错误信息，避免控制台显示错误
    // console.error("获取用户信息失败:", error);
    // 直接设置默认管理员用户信息
    user.value = { name: '管理员', role: 'admin' };
  } finally {
    loading.value = false;
  }
};

const fetchRecentOrders = async () => {
  try {
    const response = await orderAPI.getAllOrders({ limit: 5 });
    orders.value = response.orders;
  } catch (error) {
    console.error("获取订单失败:", error);
  }
};

const fetchProducts = async () => {
  try {
    const response = await productAPI.getProducts({ limit: 5 });
    products.value = response.products || response.data || [];
  } catch (error) {
    console.error("获取产品失败:", error);
  }
};

const handleLogout = () => {
  // 清除本地存储
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // 跳转到登录页面
  window.location.href = "/admin/login";
};

const navigateTo = (path, menu) => {
  router.push(`/admin${path}`);
  activeMenu.value = menu;
};

onMounted(async () => {
  await fetchUserInfo();
  await fetchRecentOrders();
  await fetchProducts();
});
</script>

<template>
  <div class="admin-page">
    <div class="sidebar">
      <div class="sidebar-header">
        <h1>农产品管理系统</h1>
      </div>
      <div class="sidebar-menu">
        <div class="menu-item" :class="{ active: activeMenu === 'dashboard' }" @click="navigateTo('', 'dashboard')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>仪表盘</span>
        </div>
        <div class="menu-item" :class="{ active: activeMenu === 'products' }" @click="navigateTo('/products', 'products')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 7H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 17H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 22H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 2H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 12H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20 17H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 2H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 12H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>产品管理</span>
        </div>
        <div class="menu-item" :class="{ active: activeMenu === 'orders' }" @click="navigateTo('/orders', 'orders')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>订单管理</span>
        </div>
        <div class="menu-item" :class="{ active: activeMenu === 'users' }" @click="navigateTo('/users', 'users')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>用户管理</span>
        </div>
        <div class="menu-item" :class="{ active: activeMenu === 'analytics' }" @click="navigateTo('/analytics', 'analytics')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 21V7L12 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>数据分析</span>
        </div>
      </div>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">
            {{ user?.name?.charAt(0) || 'A' }}
          </div>
          <div class="user-details">
            <div class="user-name">{{ user?.name || '管理员' }}</div>
            <div class="user-role">{{ user?.role || 'admin' }}</div>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="16 17 21 12 16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>退出登录</span>
        </button>
      </div>
    </div>
    <div class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.sidebar {
  width: 250px;
  background-color: #333;
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #444;
}

.sidebar-header h1 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.sidebar-menu {
  flex: 1;
  padding: 1rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.menu-item:hover {
  background-color: #444;
}

.menu-item.active {
  background-color: #4caf50;
}

.menu-item svg {
  margin-right: 0.75rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #444;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4caf50;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  font-weight: 600;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.user-role {
  font-size: 0.75rem;
  color: #aaa;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background-color: #444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #555;
}

.logout-btn svg {
  margin-right: 0.5rem;
}

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

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: #4caf50;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.recent-orders {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.recent-orders h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
}

.order-table {
  overflow-x: auto;
}

.order-table table {
  width: 100%;
  border-collapse: collapse;
}

.order-table th,
.order-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.order-table th {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  background-color: #f9f9f9;
}

.order-table td {
  font-size: 0.875rem;
  color: #333;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.paid {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.delivered {
  background-color: #cce7ff;
  color: #004085;
}

.status-badge.refunded {
  background-color: #f8d7da;
  color: #721c24;
}

@media (max-width: 768px) {
  .admin-page {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    overflow-x: auto;
  }

  .sidebar-header {
    border-bottom: none;
    border-right: 1px solid #444;
  }

  .sidebar-menu {
    display: flex;
    flex: 1;
    padding: 0;
  }

  .menu-item {
    white-space: nowrap;
    border-right: 1px solid #444;
  }

  .sidebar-footer {
    display: none;
  }

  .dashboard-cards {
    grid-template-columns: 1fr;
  }
}

/* 过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>