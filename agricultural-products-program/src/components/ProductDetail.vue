<script setup>
import { ref, onMounted, computed } from "vue";
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

// 图片轮播相关
const currentImageIndex = ref(0);
const productImages = ref([]);

// 规格选择相关
const selectedSpec = ref(null);
const productSpecs = ref([]);

// 标签页相关
const activeTab = ref('detail');

// 计算当前选中的规格价格
const currentPrice = computed(() => {
  if (selectedSpec.value) {
    return selectedSpec.value.price;
  }
  return Number(props.product.price) || 0;
});

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

// 图片轮播方法
const nextImage = () => {
  if (productImages.value.length > 0) {
    currentImageIndex.value = (currentImageIndex.value + 1) % productImages.value.length;
  }
};

const prevImage = () => {
  if (productImages.value.length > 0) {
    currentImageIndex.value = (currentImageIndex.value - 1 + productImages.value.length) % productImages.value.length;
  }
};

const goToImage = (index) => {
  currentImageIndex.value = index;
};

// 规格选择方法
const selectSpec = (spec) => {
  selectedSpec.value = spec;
};

// 标签页切换方法
const switchTab = (tab) => {
  activeTab.value = tab;
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

// 商品分享功能
const handleShare = async () => {
  try {
    // 检查是否支持Web Share API
    if (navigator.share) {
      await navigator.share({
        title: props.product.name,
        text: props.product.description,
        url: window.location.href,
      });
    } else {
      // 不支持Web Share API的浏览器，复制链接到剪贴板
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      alert("分享链接已复制到剪贴板");
    }
  } catch (err) {
    console.error("分享失败:", err);
    alert("分享失败，请稍后重试");
  }
};

onMounted(async () => {
  // 初始化图片数据
  productImages.value = [
    props.product.image,
    // 模拟更多图片
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(props.product.name + ' 农产品 高清图片')}&image_size=square_hd`,
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(props.product.name + ' 特写 高清图片')}&image_size=square_hd`,
  ].filter(Boolean);

  // 初始化规格数据（模拟）
  productSpecs.value = [
    { id: 1, name: '标准装', price: props.product.price, stock: 100 },
    { id: 2, name: '精品装', price: (Number(props.product.price) * 1.2).toFixed(2), stock: 50 },
    { id: 3, name: '家庭装', price: (Number(props.product.price) * 2.5).toFixed(2), stock: 30 },
  ];
  
  // 默认选择第一个规格
  if (productSpecs.value.length > 0) {
    selectedSpec.value = productSpecs.value[0];
  }

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
        <!-- 图片轮播区域 -->
        <div class="product-image">
          <div class="image-carousel">
            <div class="carousel-container">
              <button class="carousel-btn prev" @click="prevImage">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <img 
              v-lazy="productImages[currentImageIndex]" 
              :alt="product.name" 
              class="carousel-image" 
            />
              <button class="carousel-btn next" @click="nextImage">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <!-- 图片指示器 -->
            <div class="carousel-indicators">
              <button 
                v-for="(image, index) in productImages" 
                :key="index"
                class="indicator" 
                :class="{ active: index === currentImageIndex }"
                @click="goToImage(index)"
              ></button>
            </div>
          </div>
        </div>

        <div class="product-info">
          <h2 class="product-name">{{ product.name }}</h2>

          <div class="product-price">
            <span class="price"
              >¥{{ currentPrice.toFixed(2) }}</span
            >
            <span v-if="product.originalPrice" class="original-price">
              ¥{{ (Number(product.originalPrice) || 0).toFixed(2) }}
            </span>
            <span v-if="product.discount" class="discount-badge">
              {{ product.discount }}% OFF
            </span>
          </div>

          <div class="action-section">
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
          
          <div class="share-section">
            <button class="share-btn" @click="handleShare">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12C4 10.8954 4.89543 10 6 10H18C19.1046 10 20 10.8954 20 12V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 6L12 2L8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 2V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>分享</span>
            </button>
          </div>
        </div>

          <!-- 规格选择 -->
          <div class="spec-section">
            <h3>规格选择</h3>
            <div class="spec-options">
              <button 
                v-for="spec in productSpecs" 
                :key="spec.id"
                class="spec-option"
                :class="{ active: selectedSpec && selectedSpec.id === spec.id }"
                @click="selectSpec(spec)"
              >
                <span class="spec-name">{{ spec.name }}</span>
                <span class="spec-price">¥{{ spec.price }}</span>
                <span class="spec-stock">库存: {{ spec.stock }}</span>
              </button>
            </div>
          </div>

          <!-- 标签页 -->
          <div class="tabs-section">
            <div class="tabs">
              <button 
                class="tab" 
                :class="{ active: activeTab === 'detail' }"
                @click="switchTab('detail')"
              >
                商品详情
              </button>
              <button 
                class="tab" 
                :class="{ active: activeTab === 'specs' }"
                @click="switchTab('specs')"
              >
                规格参数
              </button>
              <button 
                class="tab" 
                :class="{ active: activeTab === 'reviews' }"
                @click="switchTab('reviews')"
              >
                商品评价
              </button>
              <button 
                class="tab" 
                :class="{ active: activeTab === 'service' }"
                @click="switchTab('service')"
              >
                售后服务
              </button>
            </div>

            <!-- 标签页内容 -->
            <div class="tab-content">
              <!-- 商品详情 -->
              <div v-if="activeTab === 'detail'" class="tab-pane">
                <h3>产品描述</h3>
                <p>{{ product.description }}</p>
                <div class="product-features">
                  <h4>产品特点</h4>
                  <ul>
                    <li>新鲜直达，保证品质</li>
                    <li>产地直采，价格实惠</li>
                    <li>绿色健康，安全放心</li>
                    <li>快速配送，及时送达</li>
                  </ul>
                </div>
              </div>

              <!-- 规格参数 -->
              <div v-if="activeTab === 'specs'" class="tab-pane">
                <h3>规格参数</h3>
                <div class="specs-table">
                  <div class="spec-row">
                    <span class="spec-label">商品名称</span>
                    <span class="spec-value">{{ product.name }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">商品编号</span>
                    <span class="spec-value">{{ product.id || 'N/A' }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">商品分类</span>
                    <span class="spec-value">{{ product.Category?.name || 'N/A' }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">保质期</span>
                    <span class="spec-value">{{ getProductShelfLife(product.name) }}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">储存方式</span>
                    <span class="spec-value">{{ getProductStorage(product.name) }}</span>
                  </div>
                </div>
              </div>

              <!-- 商品评价 -->
              <div v-if="activeTab === 'reviews'" class="tab-pane">
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

              <!-- 售后服务 -->
              <div v-if="activeTab === 'service'" class="tab-pane">
                <h3>售后服务</h3>
                <div class="service-info">
                  <div class="service-item">
                    <h4>退换货政策</h4>
                    <p>商品收到后7天内，如无质量问题，可申请退换货。</p>
                  </div>
                  <div class="service-item">
                    <h4>配送方式</h4>
                    <p>默认采用顺丰速运，部分地区支持次日达。</p>
                  </div>
                  <div class="service-item">
                    <h4>客服热线</h4>
                    <p>400-123-4567（工作时间：9:00-18:00）</p>
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

.image-carousel {
  width: 100%;
  position: relative;
}

.carousel-container {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.carousel-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.carousel-btn:hover {
  background-color: white;
  transform: translateY(-50%) scale(1.1);
}

.carousel-btn.prev {
  left: 10px;
}

.carousel-btn.next {
  right: 10px;
}

.carousel-indicators {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 5;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.indicator.active {
  background-color: white;
  width: 12px;
  border-radius: 4px;
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

/* 分享按钮样式 */
.share-section {
  margin: 1rem 0;
}

.share-btn {
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

.share-btn:hover {
  background-color: #e3f2fd;
  color: #2196f3;
  border-color: #bbdefb;
}

/* 操作区域样式 */
.action-section {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 1rem 0;
}

/* 规格选择样式 */
.spec-section {
  margin: 1.5rem 0;
}

.spec-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #333;
}

.spec-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.spec-option {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 120px;
  text-align: center;
}

.spec-option:hover {
  border-color: #2eac70;
  box-shadow: 0 2px 8px rgba(46, 172, 112, 0.1);
}

.spec-option.active {
  border-color: #2eac70;
  background-color: rgba(46, 172, 112, 0.05);
  box-shadow: 0 2px 8px rgba(46, 172, 112, 0.2);
}

.spec-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.spec-price {
  font-size: 0.875rem;
  font-weight: bold;
  color: #ff6b35;
}

.spec-stock {
  font-size: 0.75rem;
  color: #666;
}

/* 标签页样式 */
.tabs-section {
  margin-top: 1.5rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs::-webkit-scrollbar {
  display: none;
}

.tab {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  white-space: nowrap;
}

.tab:hover {
  color: #2eac70;
}

.tab.active {
  color: #2eac70;
  border-bottom-color: #2eac70;
}

.tab-content {
  min-height: 200px;
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-pane h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #333;
}

.tab-pane h4 {
  font-size: 1rem;
  font-weight: 500;
  margin: 1rem 0 0.5rem 0;
  color: #333;
}

.tab-pane p {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.product-features ul {
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0;
}

.product-features li {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.specs-table {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.spec-row {
  display: flex;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.spec-label {
  width: 120px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
  flex-shrink: 0;
}

.spec-value {
  flex: 1;
  font-size: 0.875rem;
  color: #666;
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.service-item {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.service-item h4 {
  margin-top: 0;
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
