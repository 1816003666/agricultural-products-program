<script setup>
import { ref, onMounted } from "vue";
import { reviewAPI } from "../services/api";

const reviews = ref([]);
const loading = ref(false);
const error = ref("");
const page = ref(1);
const limit = ref(10);
const totalPages = ref(1);
const filterStatus = ref("");

const fetchReviews = async () => {
  try {
    loading.value = true;
    const params = { page: page.value, limit: limit.value };
    if (filterStatus.value) {
      params.status = filterStatus.value;
    }
    const response = await reviewAPI.getAllReviews(params);
    reviews.value = response.reviews || [];
    totalPages.value = response.pagination?.pages || 1;
  } catch (err) {
    console.error("获取评价列表失败:", err);
    error.value = "获取评价列表失败";
  } finally {
    loading.value = false;
  }
};

const handleUpdateStatus = async (reviewId, status) => {
  try {
    await reviewAPI.updateReviewStatus(reviewId, { status });
    await fetchReviews();
    alert("状态更新成功");
  } catch (err) {
    console.error("更新评价状态失败:", err);
    alert("更新失败，请稍后重试");
  }
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchReviews();
};

const handleFilterChange = () => {
  page.value = 1;
  fetchReviews();
};

const getStatusClass = (status) => {
  const statusMap = {
    pending: "status-pending",
    approved: "status-approved",
    rejected: "status-rejected",
  };
  return statusMap[status] || "";
};

const getStatusText = (status) => {
  const statusMap = {
    pending: "待审核",
    approved: "已通过",
    rejected: "已拒绝",
  };
  return statusMap[status] || status;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("zh-CN");
};

const getRatingStars = (rating) => {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
};

onMounted(async () => {
  await fetchReviews();
});
</script>

<template>
  <div class="admin-reviews-page">
    <div class="page-header">
      <h1>评价管理</h1>
      <div class="filter-section">
        <select
          v-model="filterStatus"
          @change="handleFilterChange"
          class="filter-select"
        >
          <option value="">全部状态</option>
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
          <option value="rejected">已拒绝</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else class="reviews-container">
      <table class="reviews-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>商品</th>
            <th>用户</th>
            <th>评分</th>
            <th>评价内容</th>
            <th>状态</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="review in reviews" :key="review.id">
            <td>{{ review.id }}</td>
            <td class="product-cell">
              <img
                :src="review.Product?.image"
                :alt="review.Product?.name"
                class="product-image"
              />
              <span class="product-name">{{ review.Product?.name }}</span>
            </td>
            <td>{{ review.User?.username || "未知用户" }}</td>
            <td class="rating-cell">
              <span class="stars">{{ getRatingStars(review.rating) }}</span>
            </td>
            <td class="comment-cell">
              <span class="comment-text">
                {{ review.comment || "该用户未填写评价内容" }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="getStatusClass(review.status)">
                {{ getStatusText(review.status) }}
              </span>
            </td>
            <td>{{ formatDate(review.created_at) }}</td>
            <td class="actions-cell">
              <button
                v-if="review.status === 'pending'"
                class="action-btn approve-btn"
                @click="handleUpdateStatus(review.id, 'approved')"
              >
                通过
              </button>
              <button
                v-if="review.status === 'pending'"
                class="action-btn reject-btn"
                @click="handleUpdateStatus(review.id, 'rejected')"
              >
                拒绝
              </button>
              <span v-else class="no-action">-</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="reviews.length === 0" class="empty-data">暂无评价数据</div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="page === 1"
          @click="handlePageChange(page - 1)"
        >
          上一页
        </button>
        <span class="page-info"> 第 {{ page }} / {{ totalPages }} 页 </span>
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
.admin-reviews-page {
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

.filter-section {
  display: flex;
  gap: 12px;
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

.reviews-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.reviews-table {
  width: 100%;
  border-collapse: collapse;
}

.reviews-table th,
.reviews-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.reviews-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.reviews-table td {
  font-size: 14px;
  color: #666;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.product-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rating-cell .stars {
  color: #ffc107;
  font-size: 16px;
}

.comment-cell {
  max-width: 200px;
}

.comment-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background-color: #fff3e0;
  color: #ff9800;
}

.status-approved {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-rejected {
  background-color: #ffebee;
  color: #f44336;
}

.actions-cell {
  white-space: nowrap;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 8px;
}

.approve-btn {
  background-color: #4caf50;
  color: white;
}

.approve-btn:hover {
  background-color: #45a049;
}

.reject-btn {
  background-color: #f44336;
  color: white;
}

.reject-btn:hover {
  background-color: #d32f2f;
}

.no-action {
  color: #999;
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

@media (max-width: 1024px) {
  .reviews-table {
    display: block;
    overflow-x: auto;
  }
}

@media (max-width: 500px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .product-cell {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-name {
    max-width: 100px;
  }
}
</style>
