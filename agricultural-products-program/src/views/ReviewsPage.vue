<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { reviewAPI } from "../services/api";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const router = useRouter();
const reviews = ref([]);
const loading = ref(false);
const error = ref("");
const page = ref(1);
const limit = ref(10);
const totalPages = ref(1);

const fetchReviews = async () => {
  try {
    loading.value = true;
    const response = await reviewAPI.getUserReviews({
      page: page.value,
      limit: limit.value,
    });
    reviews.value = response.reviews || [];
    totalPages.value = response.pagination?.pages || 1;
  } catch (err) {
    console.error("获取评价列表失败:", err);
    error.value = "获取评价列表失败";
  } finally {
    loading.value = false;
  }
};

const handleDeleteReview = async (reviewId) => {
  if (!confirm("确定要删除这条评价吗?")) return;

  try {
    await reviewAPI.deleteReview(reviewId);
    await fetchReviews();
    alert("删除成功");
  } catch (err) {
    console.error("删除评价失败:", err);
    alert("删除失败，请稍后重试");
  }
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchReviews();
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
  <div class="reviews-page">
    <Navbar />

    <main class="reviews-main">
      <div class="container">
        <h1>我的评价</h1>

        <div v-if="loading" class="loading">加载中...</div>

        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-else class="reviews-container">
          <div v-if="reviews.length === 0" class="empty-reviews">
            <div class="empty-icon">📝</div>
            <p>暂无评价</p>
            <button class="browse-btn" @click="router.push('/')">去购物</button>
          </div>

          <div v-else class="reviews-list">
            <div v-for="review in reviews" :key="review.id" class="review-item">
              <div class="review-product">
                <img
                  :src="review.Product?.image"
                  :alt="review.Product?.name"
                  class="product-image"
                />
                <div class="product-info">
                  <div class="product-name">{{ review.Product?.name }}</div>
                  <div class="product-price">
                    ¥{{ (Number(review.Product?.price) || 0).toFixed(2) }}
                  </div>
                </div>
              </div>
              <div class="review-content">
                <div class="review-rating">
                  <span class="stars">{{ getRatingStars(review.rating) }}</span>
                  <span class="rating-value">{{ review.rating }}分</span>
                </div>
                <div class="review-comment">
                  {{ review.comment || "该用户未填写评价内容" }}
                </div>
                <div class="review-meta">
                  <span class="review-date"
                    >评价时间: {{ formatDate(review.created_at) }}</span
                  >
                  <span class="review-status" :class="review.status">
                    {{
                      review.status === "approved"
                        ? "已通过"
                        : review.status === "pending"
                          ? "审核中"
                          : "已拒绝"
                    }}
                  </span>
                </div>
              </div>
              <div class="review-actions">
                <button
                  class="delete-btn"
                  @click="handleDeleteReview(review.id)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>

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
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.reviews-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.reviews-main {
  flex: 1;
  padding: 20px 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.loading,
.error-message,
.empty-reviews {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading {
  color: #666;
}

.error-message {
  color: #f44336;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-reviews p {
  color: #666;
  margin-bottom: 20px;
}

.browse-btn {
  padding: 12px 24px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.browse-btn:hover {
  background-color: #45a049;
}

.reviews-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-product {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.product-price {
  font-size: 14px;
  color: #f44336;
  font-weight: 500;
}

.review-content {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.stars {
  font-size: 20px;
  color: #ffc107;
}

.rating-value {
  font-size: 14px;
  color: #666;
}

.review-comment {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.review-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.review-status.approved {
  background-color: #e8f5e9;
  color: #4caf50;
}

.review-status.pending {
  background-color: #fff3e0;
  color: #ff9800;
}

.review-status.rejected {
  background-color: #ffebee;
  color: #f44336;
}

.review-actions {
  display: flex;
  justify-content: flex-end;
}

.delete-btn {
  padding: 8px 16px;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-btn:hover {
  background-color: #e0e0e0;
  color: #333;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
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

@media (max-width: 500px) {
  .review-product {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-image {
    width: 100%;
    height: 200px;
  }

  .review-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
