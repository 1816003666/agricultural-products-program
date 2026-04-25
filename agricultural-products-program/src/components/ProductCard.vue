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

const isHotProduct = (product) => {
  return product.discount && Number(product.discount) >= 20;
};

const isLimitedTime = (product) => {
  return product.discount && Number(product.discount) >= 15;
};
</script>

<template>
  <div class="product-card" @click="handleViewDetail">
    <div class="product-image-wrapper">
      <div class="product-image-container">
        <img v-lazy="product.image" :alt="product.name" class="product-image" />
        <div class="image-overlay">
          <button class="quick-view-btn" @click.stop="handleViewDetail">查看详情</button>
        </div>
      </div>
      <div class="badges">
        <div v-if="product.discount" class="discount-badge">
          <span class="discount-text">优惠</span>
          <span class="discount-value">{{ product.discount }}%</span>
        </div>
        <div v-if="isHotProduct(product)" class="hot-badge">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2ZM12 16C9.33 16 4 17.34 4 20V22H20V20C20 17.34 14.67 16 12 16Z" fill="currentColor"/></svg>
          爆款
        </div>
        <div v-if="isLimitedTime(product)" class="limited-badge">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 1C7.03 1 3 5.03 3 10C3 14.97 7.03 19 12 19C16.97 19 21 14.97 21 10C21 5.03 16.97 1 12 1ZM12 17C8.13 17 5 13.87 5 10C5 6.13 8.13 3 12 3C15.87 3 19 6.13 19 10C19 13.87 15.87 17 12 17ZM12.5 7H11V11L14.25 13.05L15 11.82L12.5 10.3V7Z" fill="currentColor"/></svg>
          限时
        </div>
      </div>
    </div>

    <div class="product-content">
      <div class="product-header">
        <h3 class="product-name">{{ product.name }}</h3>
        <div class="product-stats">
          <span class="stat-item">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="currentColor"/></svg>
            4.9
          </span>
          <span class="stat-separator">•</span>
          <span class="stat-item">已售 999+</span>
        </div>
      </div>

      <div class="price-section">
        <div class="price-wrapper">
          <span class="currency">¥</span>
          <span class="price">{{ (Number(product.price) || 0).toFixed(2) }}</span>
          <span v-if="product.originalPrice" class="original-price">
            ¥{{ (Number(product.originalPrice) || 0).toFixed(2) }}
          </span>
        </div>
        <div class="save-tag" v-if="product.originalPrice">
          省 ¥{{ (Number(product.originalPrice) - Number(product.price)).toFixed(0) }}
        </div>
      </div>

      <div class="action-bar">
        <button class="add-cart-btn" @click.stop="handleAddToCart">
          <svg viewBox="0 0 24 24" fill="none"><path d="M7 18C7 19.1 6.1 20 5 20C3.9 20 3 19.1 3 18C3 16.9 3.9 16 5 16C6.1 16 7 16.9 7 18ZM17 18C17 19.1 16.1 20 15 20C13.9 20 13 19.1 13 18C13 16.9 13.9 16 15 16C16.1 16 17 16.9 17 18ZM19 6H15.54C15 5.12 14.1 4.47 13 4.13V3H11V4.13C9.9 4.47 9 5.12 8.46 6H5V8H6.64C6.78 8.56 6.99 9.09 7.26 9.58L4.17 15.14C4.06 15.33 4 15.55 4 15.78C4 16.44 4.56 17 5.22 17H19V15H7.42C7.39 14.97 7.36 14.93 7.34 14.9L9.48 11H16C16.37 11 16.72 10.83 16.97 10.54C17.22 10.25 17.36 9.88 17.36 9.5V9.5C17.36 9.36 17.32 9.22 17.26 9.1L16.26 7.1C16.13 6.85 16 6.58 15.83 6.32L15.83 6.3C15.67 6.05 15.48 5.81 15.28 5.6L15.28 5.6H19V6ZM9.74 9L8.54 6.9C8.66 6.66 8.86 6.46 9.11 6.32C9.36 6.18 9.66 6.1 10 6.1H14C14.34 6.1 14.64 6.18 14.89 6.32C15.14 6.46 15.34 6.66 15.46 6.9L14.26 9H9.74Z" fill="currentColor"/></svg>
          <span>加入购物车</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background: linear-gradient(145deg, #ffffff 0%, #fafbf5 100%);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(45, 80, 44, 0.08), 0 4px 12px rgba(45, 80, 44, 0.04);
  border: 1px solid rgba(76, 130, 75, 0.12);
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 10px 40px rgba(45, 80, 44, 0.15), 0 20px 60px rgba(45, 80, 44, 0.1);
  border-color: rgba(76, 130, 75, 0.25);
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 120%;
  background: linear-gradient(180deg, #f8faf4 0%, #eef3e6 100%);
}

.product-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover .product-image {
  transform: scale(1.08);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(45, 80, 44, 0.7) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .image-overlay {
  opacity: 1;
}

.quick-view-btn {
  background: #ffffff;
  color: #2d502c;
  border: none;
  padding: 10px 24px;
  border-radius: 25px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.quick-view-btn:hover {
  background: #4c824b;
  color: #ffffff;
  transform: translateY(-2px);
}

.badges {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  z-index: 10;
}

.discount-badge {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(211, 84, 0, 0.3);
}

.discount-value {
  font-size: 0.875rem;
}

.hot-badge {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
}

.hot-badge svg {
  width: 14px;
  height: 14px;
}

.limited-badge {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(155, 89, 182, 0.3);
}

.limited-badge svg {
  width: 14px;
  height: 14px;
}

.product-content {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-header {
  margin-bottom: 0.75rem;
}

.product-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e3a1e;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.product-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7b6a;
  font-size: 0.75rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-item svg {
  width: 14px;
  height: 14px;
  color: #f39c12;
}

.stat-separator {
  color: #ccd6c9;
}

.price-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1rem;
}

.price-wrapper {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.currency {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4c824b;
}

.price {
  font-size: 1.5rem;
  font-weight: 800;
  color: #4c824b;
  background: linear-gradient(135deg, #4c824b 0%, #2d502c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.original-price {
  font-size: 0.875rem;
  color: #a8b8a5;
  text-decoration: line-through;
  font-weight: 500;
}

.save-tag {
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.action-bar {
  margin-top: auto;
}

.add-cart-btn {
  width: 100%;
  background: linear-gradient(135deg, #4c824b 0%, #2d502c 100%);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 130, 75, 0.3);
}

.add-cart-btn:hover {
  background: linear-gradient(135deg, #5a9a59 0%, #3d6a3c 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 130, 75, 0.4);
}

.add-cart-btn:active {
  transform: translateY(0);
}

.add-cart-btn svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 1024px) {
  .product-content {
    padding: 1rem;
  }

  .price {
    font-size: 1.35rem;
  }

  .product-name {
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .product-card {
    border-radius: 16px;
  }

  .product-content {
    padding: 0.875rem;
  }

  .price {
    font-size: 1.25rem;
  }

  .product-name {
    font-size: 0.875rem;
  }

  .badges {
    top: 8px;
    left: 8px;
    right: 8px;
  }
}

@media (max-width: 480px) {
  .product-card {
    border-radius: 14px;
  }

  .product-content {
    padding: 0.75rem;
  }

  .price {
    font-size: 1.125rem;
  }

  .product-name {
    font-size: 0.8125rem;
  }

  .add-cart-btn {
    padding: 10px 14px;
    font-size: 0.8125rem;
  }
}
</style>
