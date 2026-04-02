<script setup>
import { ref } from "vue";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["add-to-cart", "close"]);

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

const handleClose = () => {
  emit("close");
};
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

          <div class="product-description">
            <h3>产品描述</h3>
            <p>{{ product.description }}</p>
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

@media (max-width: 768px) {
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
