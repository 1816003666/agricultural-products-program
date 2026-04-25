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
const shippingOrdersCount = ref(0);
const deliveredOrdersCount = ref(0);
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
    const token = localStorage.getItem("token");
    if (!token) {
      cartItems.value = [];
      return;
    }

    const cartData = await cartAPI.getCart();
    cartItems.value = (cartData.data?.items || []).map((item) => {
      if (item.Product) {
        return {
          id: item.product_id,
          name: item.Product.name,
          price: item.Product.price,
          image: item.Product.image,
          quantity: item.quantity,
        };
      }
      return item;
    });
  } catch (error) {
    console.error("获取购物车数据失败:", error);
    cartItems.value = [];
  }
};

const handleOpenCart = () => {
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
  localStorage.removeItem("token");
  localStorage.removeItem("user");
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
      await userAPI.updateAddress(
        currentAddress.value.id,
        currentAddress.value,
      );
    } else {
      await userAPI.createAddress(currentAddress.value);
    }
    await fetchAddresses();
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

const fetchShippingOrdersCount = async () => {
  try {
    const response = await orderAPI.getOrders({ status: "paid" });
    shippingOrdersCount.value = response.data?.orders?.length || 0;
  } catch (err) {
    console.error("获取待收货订单数量失败:", err);
    shippingOrdersCount.value = 0;
  }
};

const fetchDeliveredOrdersCount = async () => {
  try {
    const response = await orderAPI.getOrders({ status: "delivered" });
    deliveredOrdersCount.value = response.data?.orders?.length || 0;
  } catch (err) {
    console.error("获取待评价订单数量失败:", err);
    deliveredOrdersCount.value = 0;
  }
};

onMounted(async () => {
  try {
    await fetchUserProfile();
    await fetchAddresses();
    await fetchPendingOrdersCount();
    await fetchShippingOrdersCount();
    await fetchDeliveredOrdersCount();
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
      <div class="page-background"></div>
      <div class="container">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>

        <div v-else-if="error" class="error-message">
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
        </div>

        <div v-else-if="user" class="profile-content">
          <div
            class="profile-header"
            @click="showPersonalInfo = !showPersonalInfo"
          >
            <div class="header-decoration"></div>
            <div class="avatar-container">
              <div class="avatar">
                {{ user.name.charAt(0) }}
              </div>
              <div class="avatar-ring"></div>
            </div>
            <div class="user-info">
              <h3>{{ user.name }}</h3>
              <p class="username">@{{ user.username }}</p>
              <div class="user-badge">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ user.role === "admin" ? "管理员" : "普通会员" }}
              </div>
            </div>
            <button class="toggle-btn">
              <svg
                :class="{ rotated: showPersonalInfo }"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div
            class="profile-details"
            :class="{ expanded: showPersonalInfo }"
          >
            <div class="details-grid">
              <div class="detail-card">
                <div class="detail-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M3 8L12 13L21 8M12 21V13M5 5H19C19.5523 5 20 5.44772 20 6V18C20 18.5523 19.5523 19 19 19H5C4.44772 19 4 18.5523 4 18V6C4 5.44772 4.44772 5 5 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="detail-content">
                  <span class="label">邮箱</span>
                  <span class="value">{{ user.email }}</span>
                </div>
              </div>

              <div class="detail-card">
                <div class="detail-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92V21C22 21.5523 21.5523 22 21 22H16.92C16.3677 22 15.818 21.7797 15.3891 21.3507L13.5858 19.5474C13.2107 19.1723 13.2107 18.5631 13.5858 18.188L15.0503 16.7235C15.236 16.5377 15.236 16.2362 15.0503 16.0505L12.2929 13.2929C11.9024 12.9024 11.9024 12.2692 12.2929 11.8787L13.8787 10.2929C14.2692 9.90237 14.9024 9.90237 15.2929 10.2929L18.0503 13.0503C18.236 13.236 18.5376 13.236 18.7234 13.0503L20.1879 11.5858C20.563 11.2107 21.1722 11.2107 21.5474 11.5858L23.3507 13.3891C23.7797 13.818 24 14.3677 24 14.92V16.92" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="detail-content">
                  <span class="label">手机号</span>
                  <span class="value">{{ user.phone || "未设置" }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="order-status-section">
            <div class="section-header">
              <h3>订单状态</h3>
              <div class="section-line"></div>
            </div>
            <div class="order-status-grid">
              <div
                class="status-card"
                @click="
                  router.push({ path: '/orders', query: { status: 'paid' } })
                "
              >
                <div class="status-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M20 7H4V6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V7Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M4 7V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V7" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="status-info">
                  <div class="status-text">待收货</div>
                  <div class="status-count" v-if="shippingOrdersCount > 0">
                    {{ shippingOrdersCount }}
                  </div>
                </div>
              </div>

              <div
                class="status-card"
                @click="
                  router.push({ path: '/orders', query: { status: 'pending' } })
                "
              >
                <div class="status-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M3 10L12 2L21 10V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 21V12H15V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="status-info">
                  <div class="status-text">待付款</div>
                  <div class="status-count" v-if="pendingOrdersCount > 0">
                    {{ pendingOrdersCount }}
                  </div>
                </div>
              </div>

              <div
                class="status-card"
                @click="
                  router.push({
                    path: '/orders',
                    query: { status: 'delivered' },
                  })
                "
              >
                <div class="status-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M11.049 2.927C11.36 2.756 11.73 2.756 12.041 2.927L21.291 7.927C21.602 8.098 21.791 8.433 21.791 8.8V15.2C21.791 15.567 21.602 15.902 21.291 16.073L12.041 21.073C11.73 21.244 11.36 21.244 11.049 21.073L2.79102 16.073C2.48002 15.902 2.29102 15.567 2.29102 15.2V8.8C2.29102 8.433 2.48002 8.098 2.79102 7.927L11.049 2.927Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 12L16 14.5M12 12L8 14.5M12 12V7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="status-info">
                  <div class="status-text">待评价</div>
                  <div class="status-count" v-if="deliveredOrdersCount > 0">
                    {{ deliveredOrdersCount }}
                  </div>
                </div>
              </div>

              <div
                class="status-card"
                @click="
                  router.push({
                    path: '/orders',
                    query: { status: 'refunded' },
                  })
                "
              >
                <div class="status-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 4V20M20 4V20M4 8H20M4 16H20M9 4L9 8M15 4L15 8M9 16L9 20M15 16L15 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="status-info">
                  <div class="status-text">售后/退货</div>
                </div>
              </div>
            </div>
          </div>

          <div class="address-section">
            <div class="section-header">
              <h3>收货地址</h3>
              <div class="section-line"></div>
            </div>
            <div class="address-container">
              <div
                v-if="addresses.some((addr) => addr.is_default)"
                class="address-card"
                @click="
                  handleEditAddress(addresses.find((addr) => addr.is_default))
                "
              >
                <div class="address-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 11C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9C11.4477 9 11 9.44772 11 10C11 10.5523 11.4477 11 12 11Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="address-content">
                  <div class="address-header">
                    <span class="address-name">{{
                      addresses.find((addr) => addr.is_default).name
                    }}</span>
                    <span class="address-phone">{{
                      addresses.find((addr) => addr.is_default).phone
                    }}</span>
                    <span class="default-badge">默认</span>
                  </div>
                  <div class="address-detail">
                    {{ addresses.find((addr) => addr.is_default).province
                    }}{{ addresses.find((addr) => addr.is_default).city
                    }}{{ addresses.find((addr) => addr.is_default).district
                    }}{{ addresses.find((addr) => addr.is_default).detail }}
                  </div>
                </div>
                <div class="address-arrow">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <div v-else class="address-card empty">
                <div class="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="empty-text">暂无默认收货地址</div>
              </div>
              <button class="add-address-btn" @click="handleAddAddress">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                管理收货地址
              </button>
            </div>
          </div>

          <div class="personal-section">
            <div class="section-header">
              <h3>个人中心</h3>
              <div class="section-line"></div>
            </div>
            <div class="personal-grid">
              <div
                class="personal-card"
                @click="router.push('/orders')"
              >
                <div class="personal-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M9 5H20V19H9M9 5H4V19H9M9 5L4 3M9 5L4 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="personal-text">我的订单</span>
              </div>

              <div
                class="personal-card"
                @click="router.push('/favorites')"
              >
                <div class="personal-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4.318 6.318C4.213 6.562 4.166 6.822 4.188 7.082C4.21 7.342 4.3 7.594 4.45 7.81L12 18.5L19.55 7.81C19.818 7.433 19.947 6.959 19.902 6.485C19.857 6.011 19.643 5.571 19.297 5.225C18.953 4.879 18.512 4.665 18.038 4.62C17.564 4.575 17.09 4.704 16.713 4.97L12 8.45L7.288 4.97C6.908 4.702 6.433 4.573 5.959 4.619C5.485 4.665 5.044 4.88 4.698 5.225C4.548 5.376 4.425 5.553 4.337 5.748C4.25 5.943 4.198 6.152 4.185 6.365L4.318 6.318Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="personal-text">我的收藏</span>
              </div>

              <div
                class="personal-card"
                @click="router.push('/coupons')"
              >
                <div class="personal-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M2 9C2 9 3.5 9 5 10.5C6.5 12 6.5 14 8 15.5C9.5 17 11.5 17 13 18.5C14.5 20 16 20 16 20H21V4H16C16 4 14.5 4 13 5.5C11.5 7 9.5 7 8 8.5C6.5 10 5 10 3.5 8.5C2 7 2 7 2 7V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="personal-text">我的优惠券</span>
              </div>

              <div
                class="personal-card"
                @click="router.push('/reviews')"
              >
                <div class="personal-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M11.049 2.927C11.36 2.756 11.73 2.756 12.041 2.927L21.291 7.927C21.602 8.098 21.791 8.433 21.791 8.8V15.2C21.791 15.567 21.602 15.902 21.291 16.073L12.041 21.073C11.73 21.244 11.36 21.244 11.049 21.073L2.79102 16.073C2.48002 15.902 2.29102 15.567 2.29102 15.2V8.8C2.29102 8.433 2.48002 8.098 2.79102 7.927L11.049 2.927Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 12L16 14.5M12 12L8 14.5M12 12V7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span class="personal-text">我的评价</span>
              </div>
            </div>
          </div>

          <button class="logout-btn" @click="handleLogout">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            退出登录
          </button>
        </div>

        <div v-else class="empty-state">
          <div class="empty-illustration">
            <svg viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="90" fill="#F6F9F0"/>
              <circle cx="100" cy="80" r="40" fill="#E8F0E1"/>
              <circle cx="100" cy="160" rx="60" ry="30" fill="#E8F0E1"/>
            </svg>
          </div>
          <p>未获取到用户信息</p>
        </div>
      </div>
    </main>

    <div
      v-if="showAddressForm"
      class="address-modal-overlay"
      @click="handleCancelEdit"
    >
      <div class="address-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 11C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9C11.4477 9 11 9.44772 11 10C11 10.5523 11.4477 11 12 11Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h4>{{ currentAddress.id ? "编辑收货地址" : "添加收货地址" }}</h4>
          <button class="modal-close" @click="handleCancelEdit">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              收货人
            </label>
            <input
              type="text"
              v-model="currentAddress.name"
              placeholder="请输入收货人姓名"
            />
          </div>
          <div class="form-group">
            <label>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92V21C22 21.5523 21.5523 22 21 22H16.92C16.3677 22 15.818 21.7797 15.3891 21.3507L13.5858 19.5474C13.2107 19.1723 13.2107 18.5631 13.5858 18.188L15.0503 16.7235C15.236 16.5377 15.236 16.2362 15.0503 16.0505L12.2929 13.2929C11.9024 12.9024 11.9024 12.2692 12.2929 11.8787L13.8787 10.2929C14.2692 9.90237 14.9024 9.90237 15.2929 10.2929L18.0503 13.0503C18.236 13.236 18.5376 13.236 18.7234 13.0503L20.1879 11.5858C20.563 11.2107 21.1722 11.2107 21.5474 11.5858L23.3507 13.3891C23.7797 13.818 24 14.3677 24 14.92V16.92" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              手机号
            </label>
            <input
              type="tel"
              v-model="currentAddress.phone"
              placeholder="请输入手机号"
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>省份</label>
              <input
                type="text"
                v-model="currentAddress.province"
                placeholder="省份"
              />
            </div>
            <div class="form-group">
              <label>城市</label>
              <input
                type="text"
                v-model="currentAddress.city"
                placeholder="城市"
              />
            </div>
            <div class="form-group">
              <label>区县</label>
              <input
                type="text"
                v-model="currentAddress.district"
                placeholder="区县"
              />
            </div>
          </div>
          <div class="form-group">
            <label>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 12H15M12 9V15M21 12C21 13.8406 20.6422 15.6326 20 17.24C18.8795 20.0535 15.6075 22 12 22C8.39248 22 5.12049 20.0535 4 17.24C3.35783 15.6326 3 13.8406 3 12C3 9.51088 3.87807 7.12335 5.3934 5.3934C6.90873 3.66343 8.92585 2.62457 11.1136 2.52256C13.3013 2.42055 15.4787 3.2646 17.24 4.87" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              详细地址
            </label>
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
            <label for="isDefault">
              <span class="checkbox-icon"></span>
              设为默认地址
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn cancel" @click="handleCancelEdit">
            取消
          </button>
          <button class="btn save" @click="handleSaveAddress">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            保存
          </button>
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
  padding: 2.5rem 0;
  position: relative;
  overflow: hidden;
}

.page-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #F6F9F0 0%, #FFFFFF 30%, #F6F9F0 100%);
  z-index: -2;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  gap: 1.5rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #E8F0E1;
  border-top-color: #4c824b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  background: linear-gradient(135deg, #FFF5F5 0%, #FFE8E8 100%);
  border: 1px solid #FECACA;
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  font-size: 3rem;
}

.error-message p {
  margin: 0;
  color: #7F1D1D;
  font-size: 1rem;
}

.profile-content {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.profile-header {
  position: relative;
  background: linear-gradient(135deg, #FFFFFF 0%, #F6F9F0 100%);
  border-radius: 24px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(76, 130, 75, 0.1);
  box-shadow: 0 4px 20px rgba(76, 130, 75, 0.08);
  overflow: hidden;
}

.profile-header:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(76, 130, 75, 0.15);
  border-color: rgba(76, 130, 75, 0.2);
}

.header-decoration {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(76, 130, 75, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4c824b 0%, #2d502c 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(76, 130, 75, 0.3);
  position: relative;
  z-index: 2;
}

.avatar-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 3px solid rgba(76, 130, 75, 0.2);
  z-index: 1;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-info h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1E3A1E;
  letter-spacing: -0.02em;
}

.username {
  margin: 0;
  font-size: 0.95rem;
  color: #6B7B6A;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  background: linear-gradient(135deg, rgba(76, 130, 75, 0.1) 0%, rgba(76, 130, 75, 0.05) 100%);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #4c824b;
  width: fit-content;
}

.user-badge svg {
  width: 14px;
  height: 14px;
}

.toggle-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(76, 130, 75, 0.1);
  color: #4c824b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: #4c824b;
  color: white;
}

.toggle-btn svg {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.toggle-btn svg.rotated {
  transform: rotate(180deg);
}

.profile-details {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-details.expanded {
  max-height: 300px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1.5rem 0;
}

.detail-card {
  background: #FFFFFF;
  border: 1px solid rgba(76, 130, 75, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.detail-card:hover {
  border-color: rgba(76, 130, 75, 0.2);
  box-shadow: 0 4px 16px rgba(76, 130, 75, 0.1);
  transform: translateY(-2px);
}

.detail-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(76, 130, 75, 0.1) 0%, rgba(76, 130, 75, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4c824b;
  flex-shrink: 0;
}

.detail-icon svg {
  width: 24px;
  height: 24px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.detail-content .label {
  font-size: 0.8rem;
  color: #8A9B89;
  font-weight: 500;
}

.detail-content .value {
  font-size: 0.95rem;
  color: #1E3A1E;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1E3A1E;
  letter-spacing: -0.01em;
}

.section-line {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, #4c824b 50%, transparent 100%);
  border-radius: 2px;
}

.order-status-section,
.address-section,
.personal-section {
  margin-top: 2.5rem;
  padding-top: 0;
}

.order-status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.status-card {
  background: #FFFFFF;
  border: 1px solid rgba(76, 130, 75, 0.1);
  border-radius: 16px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.status-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(76, 130, 75, 0.12);
  border-color: rgba(76, 130, 75, 0.2);
}

.status-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(76, 130, 75, 0.1) 0%, rgba(76, 130, 75, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4c824b;
  transition: all 0.3s ease;
}

.status-card:hover .status-icon-wrapper {
  background: linear-gradient(135deg, #4c824b 0%, #2d502c 100%);
  color: white;
  transform: scale(1.05);
}

.status-icon-wrapper svg {
  width: 28px;
  height: 28px;
}

.status-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.status-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1E3A1E;
}

.status-count {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #E67E22 0%, #D35400 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(211, 84, 0, 0.3);
}

.address-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.address-card {
  background: linear-gradient(135deg, #FFFFFF 0%, #F6F9F0 100%);
  border: 1px solid rgba(76, 130, 75, 0.12);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.address-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 130, 75, 0.12);
  border-color: rgba(76, 130, 75, 0.2);
}

.address-card.empty {
  justify-content: center;
  padding: 2rem;
  cursor: default;
}

.address-card.empty:hover {
  transform: none;
  box-shadow: none;
}

.address-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(76, 130, 75, 0.15) 0%, rgba(76, 130, 75, 0.08) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4c824b;
  flex-shrink: 0;
}

.address-icon svg {
  width: 24px;
  height: 24px;
}

.address-content {
  flex: 1;
  min-width: 0;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.address-name {
  font-weight: 700;
  color: #1E3A1E;
  font-size: 0.95rem;
}

.address-phone {
  color: #6B7B6A;
  font-size: 0.9rem;
}

.default-badge {
  padding: 0.25rem 0.625rem;
  background: linear-gradient(135deg, #4c824b 0%, #2d502c 100%);
  color: white;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.address-detail {
  color: #6B7B6A;
  line-height: 1.5;
  font-size: 0.875rem;
}

.address-arrow {
  color: #A8B8A5;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.address-card:hover .address-arrow {
  color: #4c824b;
  transform: translateX(4px);
}

.address-arrow svg {
  width: 20px;
  height: 20px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(76, 130, 75, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #A8B8A5;
  margin-bottom: 0.5rem;
}

.empty-icon svg {
  width: 32px;
  height: 32px;
}

.empty-text {
  color: #8A9B89;
  font-size: 0.9rem;
  text-align: center;
}

.add-address-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(76, 130, 75, 0.1) 0%, rgba(76, 130, 75, 0.05) 100%);
  border: 2px dashed rgba(76, 130, 75, 0.3);
  border-radius: 12px;
  color: #4c824b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-address-btn:hover {
  background: linear-gradient(135deg, #4c824b 0%, #2d502c 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
}

.add-address-btn svg {
  width: 20px;
  height: 20px;
}

.personal-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.personal-card {
  background: #FFFFFF;
  border: 1px solid rgba(76, 130, 75, 0.1);
  border-radius: 16px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.personal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(76, 130, 75, 0.12);
  border-color: rgba(76, 130, 75, 0.2);
}

.personal-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(76, 130, 75, 0.1) 0%, rgba(76, 130, 75, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4c824b;
  transition: all 0.3s ease;
}

.personal-card:hover .personal-icon {
  background: linear-gradient(135deg, #4c824b 0%, #2d502c 100%);
  color: white;
  transform: scale(1.05);
}

.personal-icon svg {
  width: 28px;
  height: 28px;
}

.personal-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1E3A1E;
  text-align: center;
}

.logout-btn {
  margin-top: 2.5rem;
  width: 100%;
  padding: 1.25rem 2rem;
  background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
  border: 1px solid #FECACA;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #7F1D1D;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 2.5rem;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);
}

.logout-btn svg {
  width: 22px;
  height: 22px;
}

.empty-state {
  padding: 5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.empty-illustration {
  width: 180px;
  height: 180px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-state p {
  margin: 0;
  color: #8A9B89;
  font-size: 1rem;
}

.address-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.address-modal {
  background: #FFFFFF;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 1.75rem 2rem;
  border-bottom: 1px solid #E8F0E1;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(180deg, #F6F9F0 0%, #FFFFFF 100%);
}

.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(76, 130, 75, 0.15) 0%, rgba(76, 130, 75, 0.08) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4c824b;
}

.modal-icon svg {
  width: 24px;
  height: 24px;
}

.modal-header h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1E3A1E;
  flex: 1;
}

.modal-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(76, 130, 75, 0.08);
  color: #6B7B6A;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #FEE2E2;
  color: #DC2626;
  transform: rotate(90deg);
}

.modal-close svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 1.75rem 2rem;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1E3A1E;
}

.form-group label svg {
  width: 16px;
  height: 16px;
  color: #4c824b;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #E8F0E1;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #1E3A1E;
  background: #FFFFFF;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4c824b;
  box-shadow: 0 0 0 4px rgba(76, 130, 75, 0.1);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #A8B8A5;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem 1rem;
  background: #F6F9F0;
  border-radius: 12px;
  border: 1px solid #E8F0E1;
  transition: all 0.3s ease;
}

.checkbox-group:hover {
  border-color: #4c824b;
  background: rgba(76, 130, 75, 0.08);
}

.checkbox-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid #C8DCC5;
  cursor: pointer;
  accent-color: #4c824b;
}

.modal-footer {
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1rem;
  border-top: 1px solid #E8F0E1;
}

.btn {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn.cancel {
  background: #F6F9F0;
  color: #6B7B6A;
}

.btn.cancel:hover {
  background: #E8F0E1;
  color: #4c824b;
  transform: translateY(-2px);
}

.btn.save {
  background: linear-gradient(135deg, #4c824b 0%, #2d502c 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(76, 130, 75, 0.3);
}

.btn.save:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(76, 130, 75, 0.4);
}

.btn.save svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 1024px) {
  .order-status-grid,
  .personal-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .profile-main {
    padding: 1.5rem 0;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .profile-header {
    padding: 1.5rem;
    flex-wrap: wrap;
  }
  
  .avatar {
    width: 72px;
    height: 72px;
    font-size: 1.75rem;
  }
  
  .user-info h3 {
    font-size: 1.25rem;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .address-modal {
    width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1.25rem 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .profile-main {
    padding: 1rem 0;
  }
  
  .profile-header {
    padding: 1.25rem;
  }
  
  .avatar {
    width: 64px;
    height: 64px;
    font-size: 1.5rem;
  }
  
  .status-card,
  .personal-card {
    padding: 1.25rem 0.875rem;
  }
  
  .status-icon-wrapper,
  .personal-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }
  
  .status-icon-wrapper svg,
  .personal-icon svg {
    width: 24px;
    height: 24px;
  }
  
  .address-card {
    padding: 1rem;
    flex-wrap: wrap;
  }
  
  .address-icon {
    width: 40px;
    height: 40px;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
}
</style>