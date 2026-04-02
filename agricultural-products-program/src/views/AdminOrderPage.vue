<script setup>
import { ref, onMounted } from "vue";
import { orderAPI } from "../services/api";

const orders = ref([]);
const loading = ref(false);
const error = ref("");
const showDetailModal = ref(false);
const currentOrder = ref(null);
const orderItems = ref([]);

const fetchOrders = async () => {
  try {
    loading.value = true;
    const response = await orderAPI.getAllOrders();
    orders.value = response?.data?.orders || response?.orders || [];
    console.log("订单数据:", orders.value);
  } catch (err) {
    error.value = "获取订单列表失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchOrderDetail = async (orderId) => {
  try {
    loading.value = true;
    const response = await orderAPI.getOrderDetail(orderId);
    currentOrder.value = response;
    orderItems.value = response?.OrderItems || [];
    showDetailModal.value = true;
    console.log("订单详情:", currentOrder.value);
    console.log("订单商品:", orderItems.value);
  } catch (err) {
    error.value = "获取订单详情失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleOrderStatusUpdate = async (orderId, status) => {
  try {
    loading.value = true;
    await orderAPI.updateOrderStatus(orderId, { status });
    await fetchOrders();
  } catch (err) {
    error.value = "更新订单状态失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleDeleteOrder = async (orderId) => {
  if (confirm("确定要删除这个订单吗？")) {
    try {
      loading.value = true;
      await orderAPI.adminDeleteOrder(orderId);
      await fetchOrders();
    } catch (err) {
      error.value = "删除订单失败";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }
};

onMounted(async () => {
  await fetchOrders();
});
</script>

<template>
  <div class="main-content">
    <div class="header">
      <h2>订单管理</h2>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="order-table">
      <table>
        <thead>
          <tr>
            <th>订单号</th>
            <th>用户</th>
            <th>金额</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.user_id }}</td>
            <td>¥{{ order.total_amount }}</td>
            <td>
              <span :class="['status-badge', order.status]">
                {{ order.status }}
              </span>
            </td>
            <td>{{ order.created_at }}</td>
            <td>
              <button class="detail-btn" @click="fetchOrderDetail(order.id)">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <line
                    x1="12"
                    y1="8"
                    x2="12"
                    y2="12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <line
                    x1="12"
                    y1="16"
                    x2="12.01"
                    y2="16"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <button class="delete-btn" @click="handleDeleteOrder(order.id)">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline
                    points="3 6 5 6 21 6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 订单详情模态框 -->
    <div
      v-if="showDetailModal"
      class="modal-overlay"
      @click="showDetailModal = false"
    >
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>订单详情</h3>
          <button class="close-btn" @click="showDetailModal = false">
            <svg
              width="20"
              height="20"
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
          <div class="order-info">
            <div class="info-row">
              <span class="label">订单号:</span>
              <span class="value">{{ currentOrder?.id }}</span>
            </div>
            <div class="info-row">
              <span class="label">用户ID:</span>
              <span class="value">{{ currentOrder?.user_id }}</span>
            </div>
            <div class="info-row">
              <span class="label">总金额:</span>
              <span class="value">¥{{ currentOrder?.total_amount }}</span>
            </div>
            <div class="info-row">
              <span class="label">状态:</span>
              <span :class="['status-badge', currentOrder?.status]">{{
                currentOrder?.status
              }}</span>
            </div>
            <div class="info-row">
              <span class="label">创建时间:</span>
              <span class="value">{{ currentOrder?.created_at }}</span>
            </div>
            <div class="info-row" v-if="currentOrder?.paid_at">
              <span class="label">支付时间:</span>
              <span class="value">{{ currentOrder?.paid_at }}</span>
            </div>
            <div class="info-row" v-if="currentOrder?.delivered_at">
              <span class="label">发货时间:</span>
              <span class="value">{{ currentOrder?.delivered_at }}</span>
            </div>
            <div class="info-row" v-if="currentOrder?.refunded_at">
              <span class="label">退款时间:</span>
              <span class="value">{{ currentOrder?.refunded_at }}</span>
            </div>
          </div>

          <div class="order-items">
            <h4>订单商品</h4>
            <table class="items-table">
              <thead>
                <tr>
                  <th>商品名称</th>
                  <th>价格</th>
                  <th>数量</th>
                  <th>小计</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in orderItems" :key="item.id">
                  <td>{{ item.product_name }}</td>
                  <td>¥{{ item.price }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>¥{{ item.price * item.quantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="modal-actions">
            <button class="close-modal-btn" @click="showDetailModal = false">
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.order-table {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.order-table table {
  width: 100%;
  border-collapse: collapse;
}

.order-table th,
.order-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.order-table th {
  background-color: #f9f9f9;
  font-weight: 600;
  color: #666;
}

.order-table td {
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

.detail-btn,
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.detail-btn {
  color: #4caf50;
  margin-right: 0.5rem;
}

.delete-btn {
  color: #f44336;
}

.detail-btn:hover {
  background-color: rgba(76, 175, 80, 0.1);
}

.delete-btn:hover {
  background-color: rgba(244, 67, 54, 0.1);
}

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
  max-width: 600px;
  overflow: hidden;
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

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
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

.order-info {
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  margin-bottom: 0.75rem;
}

.info-row .label {
  width: 100px;
  font-weight: 500;
  color: #666;
}

.info-row .value {
  flex: 1;
  color: #333;
}

.order-items {
  margin-bottom: 2rem;
}

.order-items h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.items-table th {
  background-color: #f9f9f9;
  font-weight: 600;
  color: #666;
}

.items-table td {
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.close-modal-btn {
  padding: 0.75rem 1.5rem;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.close-modal-btn:hover {
  background-color: #e0e0e0;
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

  .order-table {
    overflow-x: auto;
  }

  .modal-container {
    margin: 0 1rem;
    max-height: 90vh;
  }

  .info-row {
    flex-direction: column;
  }

  .info-row .label {
    width: auto;
    margin-bottom: 0.25rem;
  }
}
</style>
