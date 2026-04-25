<script setup>
import { ref } from "vue";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["add-to-cart", "view-detail"]);

const handleViewDetail = () => {
  emit("view-detail", props.product);
};

const quantity = ref(1);

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

// 从商品名称中提取规格信息
const getProductSpecs = (name) => {
  // 匹配常见的规格格式
  const specsRegex = /\d+\s*(kg|g|斤|枚|条|只|L)/;
  const match = name.match(specsRegex);
  if (match) {
    return match[0];
  }
  return null;
};

// 获取商品保质期
const getProductShelfLife = (name) => {
  if (name.includes("草莓") || name.includes("水果")) {
    return "7天";
  } else if (name.includes("蔬菜")) {
    return "5天";
  } else if (name.includes("鸡蛋")) {
    return "30天";
  } else if (name.includes("肉")) {
    return "3天";
  } else if (
    name.includes("大米") ||
    name.includes("面粉") ||
    name.includes("干货")
  ) {
    return "12个月";
  } else {
    return "7天";
  }
};

// 获取商品储存方式
const getProductStorage = (name) => {
  if (name.includes("草莓") || name.includes("蔬菜") || name.includes("水果")) {
    return "冷藏";
  } else if (name.includes("鸡蛋") || name.includes("肉")) {
    return "冷藏";
  } else if (
    name.includes("大米") ||
    name.includes("面粉") ||
    name.includes("干货")
  ) {
    return "阴凉干燥";
  } else {
    return "冷藏";
  }
};

// 判断是否为爆款商品
const isHotProduct = (product) => {
  return product.discount && Number(product.discount) >= 20;
};

// 判断是否为限时商品
const isLimitedTime = (product) => {
  return product.discount && Number(product.discount) >= 15;
};
</script>

<template>
  <div class="product-card" @click="handleViewDetail">
    <div class="product-image">
      <img v-lazy="product.image" :alt="product.name" class="image" />
      <div v-if="product.discount" class="discount-badge">
        {{ product.discount }}% OFF
      </div>
      <div v-if="isHotProduct(product)" class="hot-badge">爆款</div>
      <div v-if="isLimitedTime(product)" class="limited-badge">限时</div>
    </div>

    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>

      <div class="product-price">
        <span class="price"
          >¥{{ (Number(product.price) || 0).toFixed(2) }}</span
        >
        <span v-if="product.originalPrice" class="original-price">
          ¥{{ (Number(product.originalPrice) || 0).toFixed(2) }}
        </span>
      </div>

      <div class="product-sales">
        <span class="sales-text">已售 999+</span>
      </div>

      <div class="product-actions">
        <button class="buy-btn" @click.stop="handleAddToCart">立即购买</button>
        <button class="add-cart-btn" @click.stop="handleAddToCart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 18C7 19.1046 6.10457 20 5 20C3.89543 20 3 19.1046 3 18C3 16.8954 3.89543 16 5 16C6.10457 16 7 16.8954 7 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 18C17 19.1046 16.1046 20 15 20C13.8954 20 13 19.1046 13 18C13 16.8954 13.8954 16 15 16C16.1046 16 17 16.8954 17 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 6V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #f0f0f0;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border-color: #2eac70;
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background-color: #f9f9f9;
}

.image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  border-radius: 12px 12px 0 0;
}

.product-card:hover .image {
  transform: scale(1.1);
}

.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff6b35;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  z-index: 1;
  animation: pulse 2s infinite;
}

.hot-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #ff4757;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  z-index: 1;
  animation: pulse 2s infinite;
}

.limited-badge {
  position: absolute;
  top: 40px;
  left: 10px;
  background-color: #ffa502;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  z-index: 1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.product-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  position: relative;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: #333;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  min-height: 2.6rem;
}

.product-price {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
  width: 100%;
}

.price {
  font-size: 1.35rem;
  font-weight: bold;
  color: #ff6b35;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.original-price {
  font-size: 0.875rem;
  color: #999;
  text-decoration: line-through;
}

.product-sales {
  margin-bottom: 0.75rem;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sales-text {
  font-size: 0.75rem;
  color: #666;
}

.product-actions {
  margin-top: auto;
  width: 100%;
  display: flex;
  gap: 0.5rem;
}

.buy-btn {
  flex: 1;
  padding: 0.75rem;
  background-color: #ff6b35;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(255, 107, 53, 0.3);
  box-sizing: border-box;
  text-align: center;
}

.buy-btn:hover {
  background-color: #e55a2b;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 107, 53, 0.4);
}

.add-cart-btn {
  width: 40px;
  height: 40px;
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.add-cart-btn:hover {
  background-color: #2eac70;
  color: white;
  border-color: #2eac70;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(46, 172, 112, 0.3);
}

@media (max-width: 1024px) {
  .product-info {
    padding: 0.875rem;
  }

  .product-name {
    font-size: 0.9375rem;
    min-height: 2.3rem;
  }

  .price {
    font-size: 1.25rem;
  }

  .buy-btn {
    padding: 0.625rem;
    font-size: 0.8125rem;
  }

  .add-cart-btn {
    width: 36px;
    height: 36px;
  }

  .add-cart-btn svg {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 768px) {
  .product-info {
    padding: 0.75rem;
  }

  .product-name {
    font-size: 0.875rem;
    min-height: 2.1rem;
  }

  .price {
    font-size: 1.15rem;
  }

  .buy-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .add-cart-btn {
    width: 32px;
    height: 32px;
  }

  .add-cart-btn svg {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 500px) {
  .product-info {
    padding: 0.75rem;
  }

  .product-name {
    font-size: 0.875rem;
    min-height: 2.1rem;
  }

  .price {
    font-size: 1.125rem;
  }

  .buy-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .add-cart-btn {
    width: 32px;
    height: 32px;
  }

  .add-cart-btn svg {
    width: 16px;
    height: 16px;
  }

  .discount-badge,
  .hot-badge,
  .limited-badge {
    font-size: 10px;
    padding: 3px 6px;
  }
}

@media (max-width: 480px) {
  .product-info {
    padding: 0.625rem;
  }

  .product-name {
    font-size: 0.8125rem;
    min-height: 1.9rem;
  }

  .price {
    font-size: 1.0625rem;
  }

  .buy-btn {
    padding: 0.4rem;
    font-size: 0.7rem;
  }

  .add-cart-btn {
    width: 28px;
    height: 28px;
  }

  .add-cart-btn svg {
    width: 14px;
    height: 14px;
  }

  .discount-badge,
  .hot-badge,
  .limited-badge {
    font-size: 9px;
    padding: 2px 4px;
  }

  .sales-text {
    font-size: 0.6875rem;
  }
}
</style>
