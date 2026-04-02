<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { authAPI, userAPI, orderAPI, cartAPI } from "../services/api";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";
import Cart from "../components/Cart.vue";

const router = useRouter();

const user = ref(null);
const loading = ref(false);
const error = ref("");
const showPersonalInfo = ref(false);
const addresses = ref([]);
const showAddressForm = ref(false);
const currentAddress = ref(null);
const pendingOrdersCount = ref(0);
const cartItems = ref([]);
const showCart = ref(false);

const cartCount = computed(() => {
  return cartItems.value.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );
});

const fetchCart = async () => {
  try {
    // 检查用户是否登录
    const token = localStorage.getItem("token");
    if (!token) {
      // 未登录用户，显示空购物车
      cartItems.value = [];
      return;
    }

    const cartData = await cartAPI.getCart();
    // 转换购物车数据格式，处理后端返回的包含Product对象的数据
    cartItems.value = (cartData.data?.items || []).map((item) => {
      if (item.Product) {
        // 后端返回的数据格式，包含Product对象
        return {
          id: item.product_id,
          name: item.Product.name,
          price: item.Product.price,
          image: item.Product.image,
          quantity: item.quantity,
        };
      }
      // 前端本地存储的数据格式
      return item;
    });
  } catch (error) {
    console.error("获取购物车数据失败:", error);
    // 当API调用失败时，显示空购物车
    cartItems.value = [];
  }
};

const handleOpenCart = () => {
  // 检查用户是否登录
  const token = localStorage.getItem("token");
  if (!token) {
    alert("请先登录");
    return;
  }
  showCart.value = true;
};

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

  // 跳转到登录页面或首页
  router.push("/");
};

const fetchAddresses = async () => {
  try {
    const response = await userAPI.getAddresses();
    addresses.value = response.data || [];
  } catch (err) {
    console.error("获取收货地址失败:", err);
  }
};

const handleEditAddress = (address) => {
  currentAddress.value = { ...address };
  showAddressForm.value = true;
};

const handleAddAddress = () => {
  if (addresses.value.length >= 10) {
    alert("最多只能添加10个收货地址");
    return;
  }
  currentAddress.value = {
    name: user.value?.name || "",
    phone: user.value?.phone || "",
    province: "",
    city: "",
    district: "",
    detail: "",
    is_default: false,
  };
  showAddressForm.value = true;
};

const handleSaveAddress = async () => {
  try {
    if (currentAddress.value.id) {
      // 更新地址
      await userAPI.updateAddress(
        currentAddress.value.id,
        currentAddress.value,
      );
    } else {
      // 创建新地址
      await userAPI.createAddress(currentAddress.value);
    }
    // 重新获取地址列表
    await fetchAddresses();
    // 关闭表单
    showAddressForm.value = false;
    currentAddress.value = null;
  } catch (err) {
    console.error("保存地址失败:", err);
    error.value = "保存地址失败";
  }
};

const handleCancelEdit = () => {
  showAddressForm.value = false;
  currentAddress.value = null;
};

const fetchPendingOrdersCount = async () => {
  try {
    const response = await orderAPI.getOrders({ status: "pending" });
    pendingOrdersCount.value = response.data?.orders?.length || 0;
  } catch (err) {
    console.error("获取待付款订单数量失败:", err);
    pendingOrdersCount.value = 0;
  }
};

onMounted(async () => {
  try {
    await fetchUserProfile();
    await fetchAddresses();
    await fetchPendingOrdersCount();
    await fetchCart();
  } catch (err) {
    console.error("页面加载失败:", err);
    loading.value = false;
  }
});
</script>

<template>
  <div class="profile-page">
    <Navbar :cart-count="cartCount" @open-cart="handleOpenCart" />

    <!-- 购物车组件 -->
    <Cart
      v-if="showCart"
      :items="cartItems"
      @update:items="
        (updatedItems) => {
          cartItems = updatedItems;
        }
      "
      @close="showCart = false"
    />

    <main class="profile-main">
      <div class="container">
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

          <!-- 收货地址区域 -->
          <div class="address-section">
            <h3>收货地址</h3>
            <div class="address-container">
              <div
                v-if="addresses.some((addr) => addr.is_default)"
                class="address-item"
                @click="
                  handleEditAddress(addresses.find((addr) => addr.is_default))
                "
              >
                <div class="address-header">
                  <span class="address-name">{{
                    addresses.find((addr) => addr.is_default).name
                  }}</span>
                  <span class="address-phone">{{
                    addresses.find((addr) => addr.is_default).phone
                  }}</span>
                  <span class="default-tag">默认</span>
                </div>
                <div class="address-detail">
                  {{ addresses.find((addr) => addr.is_default).province
                  }}{{ addresses.find((addr) => addr.is_default).city
                  }}{{ addresses.find((addr) => addr.is_default).district
                  }}{{ addresses.find((addr) => addr.is_default).detail }}
                </div>
              </div>
              <div v-else class="address-item empty-address">
                <div class="empty-address-text">暂无默认收货地址</div>
              </div>
              <div class="address-actions">
                <a
                  href="javascript:void(0)"
                  class="manage-address"
                  @click="handleAddAddress"
                  >管理收货地址</a
                >
              </div>
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
                <div v-if="pendingOrdersCount > 0" class="status-badge">
                  {{ pendingOrdersCount }}
                </div>
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
              <div class="personal-item" @click="router.push('/orders')">
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
    </main>

    <!-- 悬浮窗口 - 编辑收货地址表单 -->
    <div
      v-if="showAddressForm"
      class="address-modal-overlay"
      @click="handleCancelEdit"
    >
      <div class="address-modal" @click.stop>
        <div class="modal-header">
          <h4>{{ currentAddress.id ? "编辑收货地址" : "添加收货地址" }}</h4>
          <button class="modal-close" @click="handleCancelEdit">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>收货人</label>
            <input
              type="text"
              v-model="currentAddress.name"
              placeholder="请输入收货人姓名"
            />
          </div>
          <div class="form-group">
            <label>手机号</label>
            <input
              type="tel"
              v-model="currentAddress.phone"
              placeholder="请输入手机号"
            />
          </div>
          <div class="form-group">
            <label>省份</label>
            <input
              type="text"
              v-model="currentAddress.province"
              placeholder="请输入省份"
            />
          </div>
          <div class="form-group">
            <label>城市</label>
            <input
              type="text"
              v-model="currentAddress.city"
              placeholder="请输入城市"
            />
          </div>
          <div class="form-group">
            <label>区县</label>
            <input
              type="text"
              v-model="currentAddress.district"
              placeholder="请输入区县"
            />
          </div>
          <div class="form-group">
            <label>详细地址</label>
            <textarea
              v-model="currentAddress.detail"
              placeholder="请输入详细地址"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group checkbox-group">
            <input
              type="checkbox"
              id="isDefault"
              v-model="currentAddress.is_default"
            />
            <label for="isDefault">设为默认地址</label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn cancel" @click="handleCancelEdit">取消</button>
          <button class="btn save" @click="handleSaveAddress">保存</button>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.profile-main {
  flex: 1;
  padding: 2rem 0;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: #666;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  margin: 1rem;
  border-radius: 4px;
}

.profile-content {
  padding: 1.5rem;
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
  border-radius: 4px;
}

.profile-header:hover {
  background-color: #f9f9f9;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #4caf50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
}

.user-info h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.user-info p {
  margin: 0.25rem 0 0 0;
  font-size: 1rem;
  color: #666;
}

.toggle-icon {
  font-size: 1rem;
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
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.detail-item .label {
  font-size: 1rem;
  font-weight: 500;
  color: #666;
}

.detail-item .value {
  font-size: 1rem;
  color: #333;
}

.address-section,
.order-status-section,
.personal-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.address-section h3,
.order-status-section h3,
.personal-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
}

.address-container {
  position: relative;
}

.address-item {
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.address-actions {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  z-index: 10;
}

.manage-address {
  color: #4caf50;
  font-size: 0.85rem;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s;
}

.manage-address:hover {
  color: #45a049;
  text-decoration: underline;
}

.address-item:hover {
  background-color: #f0f0f0;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.address-name {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.address-phone {
  color: #666;
  font-size: 0.9rem;
}

.default-tag {
  margin-left: auto;
  padding: 0.15rem 0.5rem;
  background-color: #4caf50;
  color: white;
  border-radius: 10px;
  font-size: 0.75rem;
}

.address-detail {
  color: #666;
  line-height: 1.4;
  font-size: 0.9rem;
}

.empty-address {
  text-align: center;
  color: #999;
  padding: 1.5rem 1rem;
}

.empty-address-text {
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn.cancel {
  background-color: #f0f0f0;
  color: #333;
}

.btn.cancel:hover {
  background-color: #e0e0e0;
}

.btn.save {
  background-color: #4caf50;
  color: white;
}

.btn.save:hover {
  background-color: #45a049;
}

/* 悬浮窗口样式 */
.address-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.address-modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.modal-close:hover {
  background-color: #f0f0f0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .address-modal {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
}

.order-status-grid,
.personal-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.status-item,
.personal-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
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
  font-size: 2rem;
  margin-bottom: 1rem;
}

.status-text,
.personal-text {
  font-size: 1rem;
  color: #333;
  text-align: center;
}

.status-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.status-item {
  position: relative;
}

.logout-btn {
  width: 100%;
  padding: 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 2rem;
}

.logout-btn:hover {
  background-color: #d32f2f;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #666;
}

@media (max-width: 768px) {
  .container {
    margin: 0 1rem;
  }

  .order-status-grid,
  .personal-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .avatar {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .user-info h3 {
    font-size: 1.125rem;
  }

  .user-info p {
    font-size: 0.875rem;
  }

  .status-icon {
    font-size: 1.5rem;
  }

  .status-text,
  .personal-text {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .profile-main {
    padding: 1rem 0;
  }

  .container h1 {
    font-size: 1.25rem;
    padding: 1rem;
  }

  .profile-content {
    padding: 1rem;
  }

  .profile-header {
    padding: 0.75rem;
  }

  .detail-item {
    padding: 0.75rem;
  }

  .order-status-section,
  .personal-section {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
  }

  .order-status-grid,
  .personal-grid {
    gap: 1rem;
  }

  .status-item,
  .personal-item {
    padding: 1rem;
  }
}
</style>
