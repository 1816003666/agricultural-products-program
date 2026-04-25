<template>
  <div class="flash-sale">
    <div class="flash-sale-header">
      <h3 class="flash-sale-title">限时折扣</h3>
      <div v-if="flashSales.length > 0" class="countdown">
        <span class="countdown-label">剩余时间：</span>
        <div class="countdown-timer">
          <span class="countdown-item">{{ days }}</span>
          <span class="countdown-separator">天</span>
          <span class="countdown-item">{{ hours }}</span>
          <span class="countdown-separator">:</span>
          <span class="countdown-item">{{ minutes }}</span>
          <span class="countdown-separator">:</span>
          <span class="countdown-item">{{ seconds }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="flashSales.length === 0" class="empty">
      <p>暂无限时折扣活动</p>
    </div>
    
    <div v-else class="flash-sale-products">
      <div v-for="flashSale in flashSales" :key="flashSale.id" class="flash-sale-section">
        <h4 class="flash-sale-name">{{ flashSale.name }}</h4>
        <div class="products-grid">
          <div 
            v-for="item in flashSale.FlashSaleProducts" 
            :key="item.id" 
            class="flash-sale-product"
            @click="navigateToProduct(item.Product.id)"
          >
            <div class="product-image">
              <img v-lazy="item.Product.image" :alt="item.Product.name" />
              <div class="discount-badge">{{ item.discount }}%</div>
            </div>
            <div class="product-info">
              <h5 class="product-name">{{ item.Product.name }}</h5>
              <div class="product-price">
                <span class="current-price">¥{{ (item.Product.price * (1 - item.discount / 100)).toFixed(2) }}</span>
                <span class="original-price">¥{{ item.Product.price.toFixed(2) }}</span>
              </div>
              <div class="stock-info">
                <span class="stock-label">库存：</span>
                <span class="stock-value">{{ item.stock - item.sold }}/{{ item.stock }}</span>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: `${(item.sold / item.stock) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { flashSaleAPI } from "../services/api";

const router = useRouter();
const flashSales = ref([]);
const loading = ref(true);
const countdownTimer = ref(null);
const endTime = ref(new Date());

// 计算倒计时
const days = computed(() => {
  const diff = endTime.value - new Date();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

const hours = computed(() => {
  const diff = endTime.value - new Date();
  return Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
});

const minutes = computed(() => {
  const diff = endTime.value - new Date();
  return Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
});

const seconds = computed(() => {
  const diff = endTime.value - new Date();
  return Math.floor((diff % (1000 * 60)) / 1000);
});

// 获取限时折扣活动
const fetchFlashSales = async () => {
  try {
    loading.value = true;
    const response = await flashSaleAPI.getActiveFlashSales();
    flashSales.value = response.flashSales || [];
    
    // 设置最近的结束时间作为倒计时
    if (flashSales.value.length > 0) {
      const endTimes = flashSales.value.map(sale => new Date(sale.end_date));
      endTime.value = new Date(Math.min(...endTimes));
      startCountdown();
    }
  } catch (error) {
    console.error("获取限时折扣活动失败:", error);
  } finally {
    loading.value = false;
  }
};

// 开始倒计时
const startCountdown = () => {
  countdownTimer.value = setInterval(() => {
    // 倒计时自动更新
  }, 1000);
};

// 导航到商品详情页
const navigateToProduct = (productId) => {
  router.push(`/product/${productId}`);
};

onMounted(() => {
  fetchFlashSales();
});

onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }
});
</script>

<style scoped>
.flash-sale {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.flash-sale-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #ff6b6b;
}

.flash-sale-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 8px;
}

.countdown-label {
  font-size: 14px;
  color: #666;
}

.countdown-timer {
  display: flex;
  align-items: center;
  gap: 4px;
}

.countdown-item {
  background-color: #333;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.countdown-separator {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.loading, .empty {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.flash-sale-section {
  margin-bottom: 24px;
}

.flash-sale-section:last-child {
  margin-bottom: 0;
}

.flash-sale-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.flash-sale-product {
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.flash-sale-product:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.flash-sale-product:hover .product-image img {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: #ff6b6b;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.current-price {
  font-size: 16px;
  font-weight: 600;
  color: #ff6b6b;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.stock-info {
  font-size: 12px;
  color: #666;
}

.stock-label {
  margin-right: 4px;
}

.stock-value {
  margin-right: 8px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: #e9ecef;
  border-radius: 2px;
  margin-top: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4caf50;
  border-radius: 2px;
  transition: width 0.3s ease;
}

@media (max-width: 768px) {
  .flash-sale-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .product-image {
    height: 120px;
  }

  .product-name {
    font-size: 12px;
  }

  .current-price {
    font-size: 14px;
  }
}
</style>