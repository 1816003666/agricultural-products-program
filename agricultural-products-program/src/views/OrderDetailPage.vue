<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { orderAPI } from "../services/api";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const route = useRoute();
const orderId = route.params.id;

const order = ref(null);
const loading = ref(false);
const error = ref("");

const orderStatusText = computed(() => {
  if (!order.value) return "";
  const status = order.value.status;
  switch (status) {
    case "pending":
      return "待付款";
    case "paid":
      return "已发货";
    case "delivered":
      return "已收货";
    case "refunded":
      return "已退款";
    default:
      return status;
  }
});

const fetchOrderDetail = async () => {
  try {
    loading.value = true;
    const response = await orderAPI.getOrderById(orderId);
    order.value = response.data;
  } catch (err) {
    console.error("获取订单详情失败:", err);
    error.value = "获取订单详情失败";
  } finally {
    loading.value = false;
  }
};

const handleConfirmReceipt = async () => {
  try {
    loading.value = true;
    const response = await orderAPI.confirmReceipt(orderId);
    console.log("确认收货成功:", response);
    // 重新获取订单详情
    await fetchOrderDetail();
    alert("确认收货成功");
  } catch (err) {
    console.error("确认收货失败:", err);
    alert("确认收货失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const handleRefund = async () => {
  try {
    loading.value = true;
    const response = await orderAPI.requestRefund(orderId);
    console.log("申请退款成功:", response);
    // 重新获取订单详情
    await fetchOrderDetail();
    alert("申请退款成功");
  } catch (err) {
    console.error("申请退款失败:", err);
    alert("申请退款失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const handlePayOrder = async () => {
  try {
    loading.value = true;
    const response = await orderAPI.payOrder(orderId);
    console.log("支付成功:", response);
    // 重新获取订单详情
    await fetchOrderDetail();
    alert("支付成功");
  } catch (err) {
    console.error("支付失败:", err);
    alert("支付失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchOrderDetail();
});
</script>

<template>
  <div class="order-detail-page">
    <Navbar />

    <main class="order-detail-main">
      <div class="container">
        <h1>订单详情</h1>

        <div v-if="loading" class="loading">加载中...</div>

        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-else-if="order" class="order-detail-container">
          <!-- 订单状态 -->
          <div class="order-status-section">
            <div class="status-icon">
              {{
                order.status === "pending"
                  ? "💳"
                  : order.status === "paid"
                    ? "📦"
                    : order.status === "delivered"
                      ? "✅"
                      : "🔄"
              }}
            </div>
            <div class="status-text">{{ orderStatusText }}</div>
          </div>

          <!-- 收货地址 -->
          <div class="address-section">
            <h2>收货地址</h2>
            <div class="address-info">
              <div class="address-name">
                {{ order.Address.name }} {{ order.Address.phone }}
              </div>
              <div class="address-detail">
                {{ order.Address.province }}{{ order.Address.city
                }}{{ order.Address.district }}{{ order.Address.detail }}
              </div>
            </div>
          </div>

          <!-- 订单商品 -->
          <div class="order-items-section">
            <h2>订单商品</h2>
            <div class="order-items">
              <div
                v-for="item in order.OrderItems"
                :key="item.id"
                class="order-product"
              >
                <div class="product-image">
                  <img :src="item.Product.image" :alt="item.Product.name" />
                </div>
                <div class="product-info">
                  <div class="product-name">{{ item.Product.name }}</div>
                  <div class="product-price">
                    ¥{{ (Number(item.price) || 0).toFixed(2) }}
                  </div>
                </div>
                <div class="product-quantity">x{{ item.quantity }}</div>
              </div>
            </div>
          </div>

          <!-- 订单信息 -->
          <div class="order-info-section">
            <h2>订单信息</h2>
            <div class="order-info">
              <div class="info-item">
                <span class="label">订单号:</span>
                <span class="value">{{ order.id }}</span>
              </div>
              <div class="info-item">
                <span class="label">下单时间:</span>
                <span class="value">{{
                  new Date(order.created_at).toLocaleString()
                }}</span>
              </div>
              <div class="info-item" v-if="order.paid_at">
                <span class="label">支付时间:</span>
                <span class="value">{{
                  new Date(order.paid_at).toLocaleString()
                }}</span>
              </div>
              <div class="info-item" v-if="order.tracking_number">
                <span class="label">物流单号:</span>
                <span class="value">{{ order.tracking_number }}</span>
              </div>
              <div class="info-item">
                <span class="label">订单金额:</span>
                <span class="value total-amount"
                  >¥{{ (Number(order.total_amount) || 0).toFixed(2) }}</span
                >
              </div>
            </div>
          </div>

          <!-- 底部操作按钮 -->
          <div class="order-actions">
            <button
              v-if="order.status === 'pending'"
              class="action-btn pay-btn"
              @click="handlePayOrder"
            >
              立刻付款
            </button>
            <button
              v-if="order.status === 'paid'"
              class="action-btn confirm-btn"
              @click="handleConfirmReceipt"
            >
              确认收货
            </button>
            <button
              v-if="order.status === 'paid' || order.status === 'delivered'"
              class="action-btn refund-btn"
              @click="handleRefund"
            >
              退款与售后
            </button>
          </div>
        </div>

        <div v-else class="empty-order">
          <p>订单不存在</p>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.order-detail-main {
  flex: 1;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
}

.loading,
.error-message,
.empty-order {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.order-detail-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.order-status-section {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.status-icon {
  font-size: 24px;
  margin-right: 12px;
}

.status-text {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.address-section,
.order-items-section,
.order-info-section {
  margin-bottom: 20px;
}

h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.address-info {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.address-name {
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.address-detail {
  color: #666;
  line-height: 1.4;
}

.order-items {
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
}

.order-product {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-product:last-child {
  border-bottom: none;
}

.product-image {
  width: 80px;
  height: 80px;
  margin-right: 16px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f8f9fa;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.product-price {
  font-size: 14px;
  font-weight: 500;
  color: #ff6b6b;
}

.product-quantity {
  font-size: 14px;
  color: #666;
}

.order-info {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #666;
}

.value {
  color: #333;
}

.total-amount {
  font-weight: 600;
  color: #ff6b6b;
  font-size: 16px;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-btn {
  background-color: #4caf50;
  color: white;
}

.confirm-btn:hover {
  background-color: #45a049;
}

.refund-btn {
  background-color: #ff9800;
  color: white;
}

.refund-btn:hover {
  background-color: #f57c00;
}

.pay-btn {
  background-color: #2196f3;
  color: white;
}

.pay-btn:hover {
  background-color: #1976d2;
}

@media (max-width: 768px) {
  .order-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
