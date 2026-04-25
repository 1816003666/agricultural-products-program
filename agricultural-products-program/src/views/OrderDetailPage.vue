<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { orderAPI } from "../services/api";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";
import PaymentModal from "../components/PaymentModal.vue";

const route = useRoute();
const orderId = route.params.id;

const order = ref(null);
const loading = ref(false);
const error = ref("");
const showRefundModal = ref(false);
const showPaymentModal = ref(false);
const refundType = ref("refund"); // refund 或 return
const refundReason = ref("");
const refundDescription = ref("");
const trackingInfo = ref(null);
const trackingLoading = ref(false);

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

const handleRefund = () => {
  // 显示退款/退货模态框
  showRefundModal.value = true;
};

const handleSubmitRefund = async () => {
  try {
    loading.value = true;
    // 构建退款请求参数
    const refundData = {
      type: refundType.value,
      reason: refundReason.value,
      description: refundDescription.value,
    };
    const response = await orderAPI.requestRefund(orderId, refundData);
    console.log("申请退款成功:", response);
    // 重新获取订单详情
    await fetchOrderDetail();
    // 关闭模态框
    showRefundModal.value = false;
    // 重置表单
    refundType.value = "refund";
    refundReason.value = "";
    refundDescription.value = "";
    alert("申请退款成功");
  } catch (err) {
    console.error("申请退款失败:", err);
    alert("申请退款失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const handlePayOrder = () => {
  // 显示支付模态框
  showPaymentModal.value = true;
};

const handlePaymentSuccess = async () => {
  // 支付成功后重新获取订单详情
  await fetchOrderDetail();
  alert("支付成功");
};

// 获取物流信息
const fetchTrackingInfo = async () => {
  try {
    trackingLoading.value = true;
    const response = await orderAPI.getTracking(orderId);
    trackingInfo.value = response;
  } catch (err) {
    console.error("获取物流信息失败:", err);
  } finally {
    trackingLoading.value = false;
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

          <!-- 订单进度追踪 -->
          <div class="order-tracking-section">
            <h2>订单进度</h2>
            <div class="tracking-steps">
              <div class="tracking-step" :class="{ active: order.status !== 'pending' }">
                <div class="step-icon">1</div>
                <div class="step-content">
                  <div class="step-title">订单创建</div>
                  <div class="step-time">{{ new Date(order.created_at).toLocaleString() }}</div>
                </div>
              </div>
              <div class="tracking-step" :class="{ active: order.status !== 'pending' }">
                <div class="step-icon">2</div>
                <div class="step-content">
                  <div class="step-title">订单支付</div>
                  <div class="step-time">{{ order.paid_at ? new Date(order.paid_at).toLocaleString() : '待支付' }}</div>
                </div>
              </div>
              <div class="tracking-step" :class="{ active: order.status === 'delivered' }">
                <div class="step-icon">3</div>
                <div class="step-content">
                  <div class="step-title">订单发货</div>
                  <div class="step-time">{{ order.tracking_number ? '已发货' : '待发货' }}</div>
                </div>
              </div>
              <div class="tracking-step" :class="{ active: order.status === 'delivered' }">
                <div class="step-icon">4</div>
                <div class="step-content">
                  <div class="step-title">确认收货</div>
                  <div class="step-time">{{ order.delivered_at ? new Date(order.delivered_at).toLocaleString() : '待收货' }}</div>
                </div>
              </div>
            </div>

            <!-- 物流信息 -->
            <div v-if="order.tracking_number" class="logistics-section">
              <h3>物流信息</h3>
              <div class="logistics-info">
                <div class="logistics-item">
                  <span class="label">物流单号:</span>
                  <span class="value">{{ order.tracking_number }}</span>
                </div>
                <button class="tracking-btn" @click="fetchTrackingInfo" :disabled="trackingLoading">
                  {{ trackingLoading ? '加载中...' : '查看物流轨迹' }}
                </button>
                
                <!-- 物流轨迹 -->
                <div v-if="trackingInfo" class="tracking-history">
                  <div v-for="(item, index) in trackingInfo.history" :key="index" class="tracking-item">
                    <div class="tracking-time">{{ new Date(item.time).toLocaleString() }}</div>
                    <div class="tracking-status">{{ item.status }}</div>
                    <div v-if="item.location" class="tracking-location">{{ item.location }}</div>
                  </div>
                </div>
              </div>
            </div>
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

        <!-- 退款/退货模态框 -->
        <div v-if="showRefundModal" class="modal-overlay">
          <div class="refund-modal">
            <div class="modal-header">
              <h2>退款与售后</h2>
              <button class="close-btn" @click="showRefundModal = false">
                ×
              </button>
            </div>
            <div class="modal-body">
              <!-- 退款类型选择 -->
              <div class="refund-type-section">
                <h3>选择类型</h3>
                <div class="refund-type-options">
                  <label class="radio-option">
                    <input type="radio" v-model="refundType" value="refund" />
                    <span>仅退款</span>
                  </label>
                  <label class="radio-option">
                    <input type="radio" v-model="refundType" value="return" />
                    <span>退货退款</span>
                  </label>
                </div>
              </div>

              <!-- 退款原因 -->
              <div class="refund-reason-section">
                <h3>退款原因</h3>
                <select v-model="refundReason" class="reason-select">
                  <option value="">请选择退款原因</option>
                  <option value="quality">商品质量问题</option>
                  <option value="wrong_item">发错商品</option>
                  <option value="damaged">商品损坏</option>
                  <option value="other">其他原因</option>
                </select>
              </div>

              <!-- 问题描述 -->
              <div class="refund-description-section">
                <h3>问题描述</h3>
                <textarea
                  v-model="refundDescription"
                  class="description-textarea"
                  placeholder="请详细描述您遇到的问题..."
                  rows="4"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="cancel-btn" @click="showRefundModal = false">
                取消
              </button>
              <button
                class="submit-btn"
                @click="handleSubmitRefund"
                :disabled="!refundReason"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>

        <!-- 支付模态框 -->
        <PaymentModal
          v-if="showPaymentModal"
          :order-id="orderId"
          :amount="order.total_amount"
          @close="showPaymentModal = false"
          @success="handlePaymentSuccess"
        />

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

@media (max-width: 500px) {
  .order-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    text-align: center;
  }
}

/* 退款/退货模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.refund-modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.refund-type-section,
.refund-reason-section,
.refund-description-section {
  margin-bottom: 1.5rem;
}

.refund-type-section h3,
.refund-reason-section h3,
.refund-description-section h3 {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.75rem;
}

.refund-type-options {
  display: flex;
  gap: 1.5rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.reason-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
  cursor: pointer;
}

.description-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 100px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #f57c00;
}

.submit-btn:disabled {
  background-color: #ffcc80;
  cursor: not-allowed;
}

@media (max-width: 500px) {
  .refund-modal {
    width: 95%;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .refund-type-options {
    flex-direction: column;
    gap: 0.75rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
    text-align: center;
  }
}

/* 订单进度追踪样式 */
.order-tracking-section {
  margin-bottom: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.tracking-steps {
  position: relative;
  padding-left: 30px;
}

.tracking-steps::before {
  content: '';
  position: absolute;
  left: 14px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e9ecef;
}

.tracking-step {
  position: relative;
  margin-bottom: 24px;
  padding-left: 30px;
  transition: all 0.3s ease;
}

.tracking-step:last-child {
  margin-bottom: 0;
}

.tracking-step::before {
  content: '';
  position: absolute;
  left: -30px;
  top: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #e9ecef;
  border: 2px solid #dee2e6;
  transition: all 0.3s ease;
}

.tracking-step.active::before {
  background-color: #2196f3;
  border-color: #2196f3;
  box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.1);
}

.step-icon {
  position: absolute;
  left: -30px;
  top: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #fff;
  border: 2px solid #2196f3;
  color: #2196f3;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.step-content {
  background-color: #fff;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.step-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.step-time {
  font-size: 12px;
  color: #666;
}

/* 物流信息样式 */
.logistics-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.logistics-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.logistics-info {
  background-color: #fff;
  border-radius: 6px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.logistics-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.logistics-item .label {
  color: #666;
}

.logistics-item .value {
  color: #333;
  font-weight: 500;
}

.tracking-btn {
  width: 100%;
  padding: 10px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.tracking-btn:hover {
  background-color: #1976d2;
}

.tracking-btn:disabled {
  background-color: #bbdefb;
  cursor: not-allowed;
}

.tracking-history {
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.tracking-item {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.tracking-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.tracking-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.tracking-status {
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
}

.tracking-location {
  font-size: 12px;
  color: #666;
}

@media (max-width: 500px) {
  .order-tracking-section {
    padding: 16px;
  }

  .tracking-steps {
    padding-left: 20px;
  }

  .tracking-steps::before {
    left: 9px;
  }

  .tracking-step {
    padding-left: 20px;
  }

  .tracking-step::before {
    left: -20px;
  }

  .step-icon {
    left: -20px;
  }

  .step-content {
    padding: 10px;
  }

  .logistics-info {
    padding: 12px;
  }
}
</style>
