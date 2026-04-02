<script setup>
import { ref, onMounted } from "vue";
import { productAPI, orderAPI, userAPI } from "../services/api";

const loading = ref(false);
const error = ref("");
const recentOrders = ref([]);
const recentProducts = ref([]);

const fetchDashboardData = async () => {
  try {
    loading.value = true;

    // 获取最近订单
    const recentOrdersResponse = await orderAPI.getAllOrders({ limit: 5 });
    recentOrders.value = recentOrdersResponse?.orders || [];

    // 获取最近产品
    const recentProductsResponse = await productAPI.getProducts({ limit: 5 });
    recentProducts.value = recentProductsResponse?.data?.products || [];
  } catch (err) {
    error.value = "获取仪表盘数据失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchDashboardData();
});
</script>

<template>
  <div class="dashboard-content">
    <div class="header">
      <h2>仪表盘</h2>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="recent-orders">
      <h3>最近订单</h3>
      <div class="order-table">
        <table>
          <thead>
            <tr>
              <th>订单ID</th>
              <th>用户</th>
              <th>金额</th>
              <th>状态</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id">
              <td>{{ order.id }}</td>
              <td>{{ order.user_id }}</td>
              <td>¥{{ Number(order.total_amount).toFixed(2) }}</td>
              <td>
                <span class="status-badge" :class="order.status">
                  {{
                    order.status === "pending"
                      ? "待付款"
                      : order.status === "paid"
                        ? "已付款"
                        : order.status === "delivered"
                          ? "已送达"
                          : "已退款"
                  }}
                </span>
              </td>
              <td>{{ new Date(order.created_at).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="recent-products">
      <h3>最近产品</h3>
      <div class="product-table">
        <table>
          <thead>
            <tr>
              <th>产品ID</th>
              <th>名称</th>
              <th>价格</th>
              <th>库存</th>
              <th>分类</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in recentProducts" :key="product.id">
              <td>{{ product.id }}</td>
              <td>{{ product.name }}</td>
              <td>¥{{ product.price }}</td>
              <td>{{ product.stock }}</td>
              <td>{{ product.Category?.name || "未分类" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-content {
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

.recent-orders,
.recent-products {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.recent-orders h3,
.recent-products h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
}

.order-table,
.product-table {
  overflow-x: auto;
}

.order-table table,
.product-table table {
  width: 100%;
  border-collapse: collapse;
}

.order-table th,
.order-table td,
.product-table th,
.product-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.order-table th,
.product-table th {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  background-color: #f9f9f9;
}

.order-table td,
.product-table td {
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
  .order-table,
  .product-table {
    overflow-x: auto;
  }
}
</style>
