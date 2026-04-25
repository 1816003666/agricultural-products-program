<script setup>
import { ref, onMounted } from "vue";
import { favoriteAPI, reviewAPI } from "../services/api";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["add-to-cart", "close"]);

const quantity = ref(1);
const isFavorite = ref(false);
const reviews = ref([]);
const reviewStats = ref({
  averageRating: 0,
  totalReviews: 0,
});
const loadingReviews = ref(false);

const checkFavoriteStatus = async () => {
  try {
    // 检查用户是否已登录
    const token = localStorage.getItem("token");
    if (!token) {
      isFavorite.value = false;
      return;
    }
    const response = await favoriteAPI.checkFavorite(props.product.id);
    isFavorite.value = response.isFavorite;
  } catch (err) {
    console.error("检查收藏状态失败:", err);
    isFavorite.value = false;
  }
};

const fetchProductReviews = async () => {
  try {
    loadingReviews.value = true;
    const response = await reviewAPI.getProductReviews(props.product.id, {
      limit: 10,
    });
    reviews.value = response.reviews || [];
    if (response.statistics) {
      reviewStats.value = response.statistics;
    }
  } catch (err) {
    console.error("获取商品评价失败:", err);
  } finally {
    loadingReviews.value = false;
  }
};

const getRatingStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = "★".repeat(fullStars);
  if (hasHalfStar) {
    stars += "½";
  }
  stars += "☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  return stars;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("zh-CN");
};

const handleAddToCart = () => {
  emit("add-to-cart", {
    ...props.product,
    quantity: quantity.value,
  });
  console.log("添加到购物车:", props.product.name, "数量:", quantity.value);
};

const handleQuantityChange = (delta) => {
  if (quantity.value + delta >= 1) {
    quantity.value += delta;
  }
};

const handleClose = () => {
  emit("close");
};

const handleToggleFavorite = async () => {
  try {
    // 检查用户是否已登录
    const token = localStorage.getItem("token");
    if (!token) {
      alert("请先登录");
      return;
    }
    if (isFavorite.value) {
      await favoriteAPI.removeFavorite(props.product.id);
    } else {
      await favoriteAPI.addFavorite(props.product.id);
    }
    isFavorite.value = !isFavorite.value;
  } catch (err) {
    console.error("收藏操作失败:", err);
    alert(err.response?.data?.message || "操作失败，请先登录");
  }
};

onMounted(async () => {
  await Promise.all([checkFavoriteStatus(), fetchProductReviews()]);
});
</script>

<template>
  <div class="product-detail">
    <div class="product-detail-container">
      <button class="close-btn" @click="handleClose">
        <svg
          width="24"
          height="24"
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

      <div class="product-content">
        <div class="product-image">
          <img :src="product.image" :alt="product.name" class="image" />
        </div>

        <div class="product-info">
          <h2 class="product-name">{{ product.name }}</h2>

          <div class="product-price">
            <span class="price"
              >¥{{ (Number(product.price) || 0).toFixed(2) }}</span
            >
            <span v-if="product.originalPrice" class="original-price">
              ¥{{ (Number(product.originalPrice) || 0).toFixed(2) }}
            </span>
            <span v-if="product.discount" class="discount-badge">
              {{ product.discount }}% OFF
            </span>
          </div>

          <div class="favorite-section">
            <button
              class="favorite-btn"
              @click="handleToggleFavorite"
              :class="{ active: isFavorite }"
            >
              <svg
                v-if="!isFavorite"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg
                v-else
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
                />
              </svg>
              <span>{{ isFavorite ? "已收藏" : "收藏" }}</span>
            </button>
          </div>

          <div class="product-description">
            <h3>产品描述</h3>
            <p>{{ product.description }}</p>
          </div>

          <!-- 商品评价区域 -->
          <div class="product-reviews">
            <h3>商品评价</h3>

            <!-- 评价统计 -->
            <div class="review-stats">
              <div class="rating-overview">
                <div class="rating-score">{{ reviewStats.averageRating }}</div>
                <div class="rating-stars">
                  {{ getRatingStars(reviewStats.averageRating) }}
                </div>
                <div class="rating-count">
                  {{ reviewStats.totalReviews }} 条评价
                </div>
              </div>
            </div>

            <!-- 评价列表 -->
            <div class="review-list">
              <div v-if="loadingReviews" class="loading-reviews">加载中...</div>
              <div v-else-if="reviews.length === 0" class="no-reviews">
                暂无评价
              </div>
              <div v-else class="review-items">
                <div
                  v-for="review in reviews"
                  :key="review.id"
                  class="review-item"
                >
                  <div class="review-header">
                    <div class="reviewer-info">
                      <span class="reviewer-name">{{
                        review.User?.username || "匿名用户"
                      }}</span>
                      <span class="review-rating">{{
                        getRatingStars(review.rating)
                      }}</span>
                    </div>
                    <div class="review-date">
                      {{ formatDate(review.created_at) }}
                    </div>
                  </div>
                  <div class="review-content">
                    {{ review.comment || "该用户未填写评价内容" }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="product-actions">
            <div class="quantity-control">
              <button
                class="quantity-btn"
                @click="handleQuantityChange(-1)"
                :disabled="quantity <= 1"
              >
                -
              </button>
              <span class="quantity">{{ quantity }}</span>
              <button class="quantity-btn" @click="handleQuantityChange(1)">
                +
              </button>
            </div>

            <button class="add-to-cart-btn" @click="handleAddToCart">
              加入购物车
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-detail {
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
  padding: 1rem;
}

.product-detail-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
  z-index: 10;
}

.close-btn:hover {
  color: #333;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
}

.product-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.image {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
}

.price {
  font-size: 1.75rem;
  font-weight: bold;
  color: #f44336;
}

.original-price {
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
}

.discount-badge {
  background-color: #f44336;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.product-description {
  flex: 1;
}

.product-description h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.product-description p {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* 商品评价样式 */
.product-reviews {
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
  margin-top: 1rem;
}

.product-reviews h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #333;
}

.review-stats {
  margin-bottom: 1.5rem;
}

.rating-overview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.rating-score {
  font-size: 2rem;
  font-weight: bold;
  color: #f44336;
}

.rating-stars {
  font-size: 1.25rem;
  color: #ffc107;
}

.rating-count {
  font-size: 0.875rem;
  color: #666;
}

.review-list {
  max-height: 300px;
  overflow-y: auto;
}

.loading-reviews,
.no-reviews {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-size: 0.875rem;
}

.review-item {
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.reviewer-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.review-rating {
  font-size: 0.875rem;
  color: #ffc107;
}

.review-date {
  font-size: 0.75rem;
  color: #999;
}

.review-content {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.5;
}

.favorite-section {
  margin: 1rem 0;
}

.favorite-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s;
}

.favorite-btn:hover {
  background-color: #e0e0e0;
  color: #333;
}

.favorite-btn.active {
  background-color: #ffebee;
  color: #f44336;
  border-color: #ffcdd2;
}

.product-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: auto;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border: none;
  background-color: #f5f5f5;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.quantity-btn:hover {
  background-color: #e0e0e0;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  width: 60px;
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
}

.add-to-cart-btn {
  flex: 1;
  padding: 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.3s;
}

.add-to-cart-btn:hover {
  background-color: #45a049;
}

@media (max-width: 500px) {
  .product-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .product-price {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .product-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .quantity-control {
    width: 100%;
    justify-content: center;
  }

  .quantity {
    width: 80px;
  }
}
</style>
