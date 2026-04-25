<script setup>
import { ref, onMounted } from "vue";
import { operationLogAPI } from "../services/api";

const logs = ref([]);
const loading = ref(false);
const error = ref("");
const page = ref(1);
const limit = ref(20);
const totalPages = ref(1);
const filterAction = ref("");
const actionStats = ref([]);

const actionTypes = [
  { value: "", label: "全部操作" },
  { value: "LOGIN", label: "登录" },
  { value: "LOGOUT", label: "登出" },
  { value: "CREATE_PRODUCT", label: "创建商品" },
  { value: "UPDATE_PRODUCT", label: "更新商品" },
  { value: "DELETE_PRODUCT", label: "删除商品" },
  { value: "CREATE_ORDER", label: "创建订单" },
  { value: "UPDATE_ORDER", label: "更新订单" },
  { value: "DELETE_ORDER", label: "删除订单" },
  { value: "UPDATE_USER", label: "更新用户" },
  { value: "DELETE_USER", label: "删除用户" },
  { value: "CREATE_COUPON", label: "创建优惠券" },
  { value: "UPDATE_COUPON", label: "更新优惠券" },
  { value: "DELETE_COUPON", label: "删除优惠券" },
  { value: "UPDATE_REVIEW", label: "审核评价" },
  { value: "DELETE_REVIEW", label: "删除评价" },
];

const fetchLogs = async () => {
  try {
    loading.value = true;
    const params = { page: page.value, limit: limit.value };
    if (filterAction.value) {
      params.action = filterAction.value;
    }
    const response = await operationLogAPI.getLogs(params);
    logs.value = response.logs || [];
    totalPages.value = response.pagination?.pages || 1;
  } catch (err) {
    console.error("获取操作日志失败:", err);
    error.value = "获取操作日志失败";
  } finally {
    loading.value = false;
  }
};

const fetchActionStats = async () => {
  try {
    const response = await operationLogAPI.getActionStats();
    actionStats.value = response.stats || [];
  } catch (err) {
    console.error("获取操作统计失败:", err);
  }
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchLogs();
};

const handleFilterChange = () => {
  page.value = 1;
  fetchLogs();
};

const handleClearLogs = async () => {
  if (confirm("确定要清空所有操作日志吗？此操作不可恢复！")) {
    try {
      await operationLogAPI.clearLogs();
      await fetchLogs();
      alert("清空成功");
    } catch (err) {
      console.error("清空日志失败:", err);
      alert("清空失败，请稍后重试");
    }
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("zh-CN");
};

const getActionText = (action) => {
  const actionMap = {
    LOGIN: "登录",
    LOGOUT: "登出",
    CREATE_PRODUCT: "创建商品",
    UPDATE_PRODUCT: "更新商品",
    DELETE_PRODUCT: "删除商品",
    CREATE_ORDER: "创建订单",
    UPDATE_ORDER: "更新订单",
    DELETE_ORDER: "删除订单",
    UPDATE_USER: "更新用户",
    DELETE_USER: "删除用户",
    CREATE_COUPON: "创建优惠券",
    UPDATE_COUPON: "更新优惠券",
    DELETE_COUPON: "删除优惠券",
    UPDATE_REVIEW: "审核评价",
    DELETE_REVIEW: "删除评价",
  };
  return actionMap[action] || action;
};

const getActionClass = (action) => {
  if (action.includes("CREATE")) return "action-create";
  if (action.includes("UPDATE")) return "action-update";
  if (action.includes("DELETE")) return "action-delete";
  if (action.includes("LOGIN") || action.includes("LOGOUT"))
    return "action-login";
  return "";
};

onMounted(async () => {
  await Promise.all([fetchLogs(), fetchActionStats()]);
});
</script>

<template>
  <div class="admin-logs-page">
    <div class="page-header">
      <h1>操作日志</h1>
      <div class="header-actions">
        <button class="clear-btn" @click="handleClearLogs">清空日志</button>
      </div>
    </div>

    <!-- 操作统计 -->
    <div class="stats-section">
      <h2>操作统计</h2>
      <div class="stats-grid">
        <div v-for="stat in actionStats" :key="stat.action" class="stat-item">
          <span class="stat-label">{{
            getActionText(stat.action) || stat.action
          }}</span>
          <span class="stat-count">{{ stat.count }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="filter-section">
      <select
        v-model="filterAction"
        @change="handleFilterChange"
        class="filter-select"
      >
        <option
          v-for="type in actionTypes"
          :key="type.value"
          :value="type.value"
        >
          {{ type.label }}
        </option>
      </select>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else class="logs-container">
      <table class="logs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户</th>
            <th>操作类型</th>
            <th>操作对象</th>
            <th>描述</th>
            <th>IP地址</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ log.id }}</td>
            <td>
              <div class="user-info">
                <span class="username">{{
                  log.User?.username || "未知用户"
                }}</span>
                <span class="role">({{ log.User?.role || "unknown" }})</span>
              </div>
            </td>
            <td>
              <span class="action-badge" :class="getActionClass(log.action)">
                {{ getActionText(log.action) }}
              </span>
            </td>
            <td>
              <span v-if="log.target_type"
                >{{ log.target_type }} #{{ log.target_id }}</span
              >
              <span v-else>-</span>
            </td>
            <td class="description-cell">{{ log.description || "-" }}</td>
            <td>{{ log.ip_address || "-" }}</td>
            <td>{{ formatDate(log.created_at) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="logs.length === 0" class="empty-data">暂无操作日志</div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="page === 1"
          @click="handlePageChange(page - 1)"
        >
          上一页
        </button>
        <span class="page-info">第 {{ page }} / {{ totalPages }} 页</span>
        <button
          class="page-btn"
          :disabled="page === totalPages"
          @click="handlePageChange(page + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-logs-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.clear-btn {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

.stats-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-section h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #333;
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-count {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-select {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.loading,
.error-message,
.empty-data {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading,
.empty-data {
  color: #666;
}

.error-message {
  color: #f44336;
}

.logs-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table th,
.logs-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.logs-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.logs-table td {
  font-size: 14px;
  color: #666;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-weight: 500;
  color: #333;
}

.role {
  font-size: 12px;
  color: #999;
}

.action-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.action-create {
  background-color: #e8f5e9;
  color: #4caf50;
}

.action-update {
  background-color: #e3f2fd;
  color: #2196f3;
}

.action-delete {
  background-color: #ffebee;
  color: #f44336;
}

.action-login {
  background-color: #fff3e0;
  color: #ff9800;
}

.description-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.page-btn {
  padding: 8px 16px;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.page-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}
</style>
