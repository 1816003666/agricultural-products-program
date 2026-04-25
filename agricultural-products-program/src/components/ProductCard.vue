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
      <img :src="product.image" :alt="product.name" class="image" />
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
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
}

.image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
  border-radius: 12px 12px 0 0;
}

.product-card:hover .image {
  transform: scale(1.05);
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
}

.product-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: #333;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.product-price {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
  width: 100%;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2eac70;
}

.original-price {
  font-size: 0.875rem;
  color: #999;
  text-decoration: line-through;
}

.product-sales {
  margin-bottom: 1rem;
  width: 100%;
}

.sales-text {
  font-size: 0.75rem;
  color: #666;
}

.product-actions {
  margin-top: auto;
  width: 100%;
}

.buy-btn {
  width: 100%;
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
}

.buy-btn:hover {
  background-color: #e55a2b;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 107, 53, 0.4);
}

@media (max-width: 1024px) {
  .product-info {
    padding: 0.875rem;
  }

  .product-name {
    font-size: 0.9375rem;
  }

  .price {
    font-size: 1.1875rem;
  }

  .buy-btn {
    padding: 0.625rem;
    font-size: 0.8125rem;
  }
}

@media (max-width: 500px) {
  .product-info {
    padding: 0.75rem;
  }

  .product-name {
    font-size: 0.875rem;
  }

  .price {
    font-size: 1.125rem;
  }

  .buy-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
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
  }

  .price {
    font-size: 1.0625rem;
  }

  .buy-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
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
