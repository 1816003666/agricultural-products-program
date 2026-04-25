<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { orderAPI } from "../services/api";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const router = useRouter();
const route = useRoute();
const orders = ref([]);
const loading = ref(false);
const error = ref("");
const isManageMode = ref(false);
const selectedOrders = ref([]);
const showReviewModal = ref(false);
const currentOrder = ref(null);
const reviews = ref([]);

const fetchOrders = async () => {
  try {
    loading.value = true;
    console.log("开始获取订单列表");
    // 获取 URL 查询参数中的 status
    const status = route.query.status;
    console.log("过滤状态:", status);
    // 根据 status 参数获取订单
    const response = await orderAPI.getOrders({ status });
    console.log("获取订单列表响应:", response);
    // 检查响应格式
    if (response && response.data && response.data.orders) {
      orders.value = response.data.orders;
    } else if (response && response.orders) {
      orders.value = response.orders;
    } else {
      orders.value = [];
    }
    console.log("订单列表:", orders.value);
  } catch (err) {
    console.error("获取订单列表失败:", err);
    console.error("错误详情:", err.response ? err.response.data : err.message);
    error.value = "获取订单列表失败";
  } finally {
    loading.value = false;
  }
};

const handlePayOrder = async (orderId) => {
  try {
    loading.value = true;
    const response = await orderAPI.payOrder(orderId);
    console.log("支付成功:", response);
    // 重新获取订单列表
    await fetchOrders();
    alert("支付成功，订单已发货");
  } catch (err) {
    console.error("支付失败:", err);
    error.value = "支付失败，请稍后重试";
    alert("支付失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const handleOrderClick = (orderId) => {
  if (!isManageMode.value) {
    router.push(`/order/${orderId}`);
  }
};

const toggleManageMode = () => {
  isManageMode.value = !isManageMode.value;
  selectedOrders.value = [];
};

const toggleOrderSelection = (orderId) => {
  const index = selectedOrders.value.indexOf(orderId);
  if (index > -1) {
    selectedOrders.value.splice(index, 1);
  } else {
    selectedOrders.value.push(orderId);
  }
};

const selectAllOrders = () => {
  if (selectedOrders.value.length === orders.value.length) {
    selectedOrders.value = [];
  } else {
    selectedOrders.value = orders.value.map((order) => order.id);
  }
};

const handleBatchDelete = async () => {
  if (selectedOrders.value.length === 0) {
    alert("请选择要删除的订单");
    return;
  }

  try {
    loading.value = true;
    // 批量删除订单
    for (const orderId of selectedOrders.value) {
      await orderAPI.deleteOrder(orderId);
    }

    // 重新获取订单列表
    await fetchOrders();
    // 退出管理模式
    isManageMode.value = false;
    selectedOrders.value = [];
    alert("删除成功");
  } catch (err) {
    console.error("批量删除订单失败:", err);
    alert("删除失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const handleDeleteOrder = async (orderId) => {
  try {
    loading.value = true;
    console.log("开始执行删除操作:", orderId);
    // 删除订单
    const response = await orderAPI.deleteOrder(orderId);
    console.log("删除订单响应:", response);

    // 重新获取订单列表
    console.log("重新获取订单列表");
    await fetchOrders();
    console.log("订单列表更新后:", orders.value);
    // 清除选中状态
    const index = selectedOrders.value.indexOf(orderId);
    if (index > -1) {
      selectedOrders.value.splice(index, 1);
    }
    alert("删除成功");
  } catch (err) {
    console.error("删除订单失败:", err);
    console.error("错误详情:", err.response ? err.response.data : err.message);
    alert("删除失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const handleReviewOrder = async (orderId) => {
  try {
    loading.value = true;
    // 获取订单详情
    const response = await orderAPI.getOrderById(orderId);
    currentOrder.value = response.data;
    // 初始化评价数据
    reviews.value = currentOrder.value.OrderItems.map((item) => ({
      productId: item.Product.id,
      productName: item.Product.name,
      rating: 5,
      comment: "",
    }));
    // 显示评价模态框
    showReviewModal.value = true;
  } catch (err) {
    console.error("获取订单详情失败:", err);
    alert("获取订单详情失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const handleSubmitReview = async () => {
  try {
    loading.value = true;
    // 这里应该调用评价API，目前我们只是模拟提交
    console.log("提交评价:", reviews.value);
    // 关闭模态框
    showReviewModal.value = false;
    // 显示成功消息
    alert("评价成功，感谢您的反馈");
  } catch (err) {
    console.error("提交评价失败:", err);
    alert("提交评价失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchOrders();
});
</script>

<template>
  <div class="order-list-page">
    <Navbar />

    <main class="order-list-main">
      <div class="container">
        <div class="page-header">
          <h1>我的订单</h1>
          <button class="manage-btn" @click="toggleManageMode">
            {{ isManageMode ? "取消管理" : "订单管理" }}
          </button>
        </div>

        <div v-if="loading" class="loading">加载中...</div>

        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-else>
          <!-- 批量操作区域 -->
          <div v-if="isManageMode && orders.length > 0" class="batch-actions">
            <label class="select-all">
              <input
                type="checkbox"
                :checked="
                  selectedOrders.length === orders.length && orders.length > 0
                "
                @change="selectAllOrders"
              />
              全选
            </label>
            <button
              class="delete-btn"
              @click="handleBatchDelete"
              :disabled="selectedOrders.length === 0"
            >
              批量删除 ({{ selectedOrders.length }})
            </button>
          </div>

          <div class="orders-container">
            <div v-if="orders.length === 0" class="empty-orders">
              <p>暂无订单</p>
            </div>
            <div v-else class="orders-list">
              <div
                v-for="order in orders"
                :key="order.id"
                class="order-item"
                @click="handleOrderClick(order.id)"
                :class="{ selected: selectedOrders.includes(order.id) }"
              >
                <div v-if="isManageMode" class="order-checkbox">
                  <input
                    type="checkbox"
                    :checked="selectedOrders.includes(order.id)"
                    @change.stop="toggleOrderSelection(order.id)"
                  />
                </div>
                <div class="order-content">
                  <div class="order-header">
                    <div class="order-id">订单号: {{ order.id }}</div>
                    <div class="order-status">
                      {{ 
                        order.status === "pending"
                          ? "待付款"
                          : order.status === "paid"
                            ? "已发货"
                            : order.status === "delivered"
                              ? "已完成"
                              : order.status === "refunded"
                                ? "已退款"
                                : order.status
                      }}
                    </div>
                  </div>
                  <div class="order-items">
                    <div
                      v-for="item in order.OrderItems"
                      :key="item.id"
                      class="order-product"
                    >
                      <div class="product-name">{{ item.Product.name }}</div>
                      <div class="product-quantity">x{{ item.quantity }}</div>
                      <div class="product-price">
                        ¥{{
                          (
                            Number(item.price) * Number(item.quantity) || 0
                          ).toFixed(2)
                        }}
                      </div>
                    </div>
                  </div>
                  <div class="order-footer">
                    <div class="order-total">
                      总计: ¥{{ (Number(order.total_amount) || 0).toFixed(2) }}
                    </div>
                    <div class="order-actions">
                      <button
                        v-if="order.status === 'pending'"
                        class="pay-btn"
                        @click.stop="handlePayOrder(order.id)"
                      >
                        付款
                      </button>
                      <button
                        v-if="order.status === 'delivered'"
                        class="review-btn"
                        @click.stop="handleReviewOrder(order.id)"
                      >
                        评价
                      </button>
                      <button
                        v-if="isManageMode"
                        class="delete-btn"
                        @click.stop="handleDeleteOrder(order.id)"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 评价模态框 -->
        <div v-if="showReviewModal" class="modal-overlay">
          <div class="review-modal">
            <div class="modal-header">
              <h2>评价订单</h2>
              <button class="close-btn" @click="showReviewModal = false">
                ×
              </button>
            </div>
            <div class="modal-body">
              <div
                v-for="(review, index) in reviews"
                :key="index"
                class="review-item"
              >
                <div class="review-product-name">{{ review.productName }}</div>
                <div class="review-rating">
                  <span>评分:</span>
                  <div class="stars">
                    <span
                      v-for="star in 5"
                      :key="star"
                      class="star"
                      :class="{ active: star <= review.rating }"
                      @click="review.rating = star"
                      >★</span
                    >
                  </div>
                </div>
                <div class="review-comment">
                  <span>评论:</span>
                  <textarea
                    v-model="review.comment"
                    placeholder="请输入您的评价..."
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="cancel-btn" @click="showReviewModal = false">
                取消
              </button>
              <button class="submit-btn" @click="handleSubmitReview">
                提交评价
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.order-list-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.order-list-main {
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.manage-btn {
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.manage-btn:hover {
  background-color: #45a049;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
}

.delete-btn {
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-btn:hover:not(:disabled) {
  background-color: #d32f2f;
}

.delete-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.order-item {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
}

.order-item.selected {
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
}

.order-checkbox {
  display: flex;
  align-items: flex-start;
  padding-top: 0.5rem;
}

.order-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.order-content {
  flex: 1;
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

.orders-container {
  padding: 1.5rem;
}

.empty-orders {
  text-align: center;
  color: #999;
  padding: 4rem 1rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-item {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.order-id {
  font-size: 0.9rem;
  color: #666;
}

.order-status {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.order-product {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-name {
  font-size: 0.9rem;
  color: #333;
  flex: 1;
}

.product-quantity {
  font-size: 0.9rem;
  color: #666;
  margin: 0 1rem;
}

.product-price {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.order-actions .delete-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.order-total {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.pay-btn {
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pay-btn:hover {
  background-color: #45a049;
}

@media (max-width: 500px) {
  .container {
    margin: 0 1rem;
  }

  .container h1 {
    font-size: 1.25rem;
    padding: 1rem;
  }

  .orders-container {
    padding: 1rem;
  }

  .order-item {
    padding: 1rem;
  }

  .order-product {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .product-quantity {
    margin: 0;
  }
}

@media (max-width: 480px) {
  .order-list-main {
    padding: 1rem 0;
  }

  .orders-list {
    gap: 1rem;
  }

  .order-item {
    padding: 0.75rem;
  }
}

/* 评价按钮样式 */
.review-btn {
  padding: 0.5rem 1rem;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.review-btn:hover {
  background-color: #1976d2;
}

/* 评价模态框样式 */
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

.review-modal {
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

.review-item {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.review-product-name {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 1rem;
}

.review-rating {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.review-rating span {
  font-size: 0.9rem;
  color: #666;
  margin-right: 1rem;
}

.stars {
  display: flex;
  gap: 0.5rem;
}

.star {
  font-size: 1.5rem;
  color: #ddd;
  cursor: pointer;
  transition: color 0.3s;
}

.star.active {
  color: #ffc107;
}

.review-comment {
  margin-bottom: 1rem;
}

.review-comment span {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.review-comment textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  resize: vertical;
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
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #45a049;
}

@media (max-width: 500px) {
  .review-modal {
    width: 95%;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
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
</style>
