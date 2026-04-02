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
</script>

<template>
  <div class="product-card" @click="handleViewDetail">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" class="image" />
      <div v-if="product.discount" class="discount-badge">
        {{ product.discount }}%
      </div>
    </div>

    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-description">{{ product.description }}</p>

      <div class="product-price">
        <span class="price"
          >¥{{ (Number(product.price) || 0).toFixed(2) }}</span
        >
        <span v-if="product.originalPrice" class="original-price">
          ¥{{ (Number(product.originalPrice) || 0).toFixed(2) }}
        </span>
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

        <button class="add-to-cart-btn" @click.stop="handleAddToCart">
          加入购物车
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background-color: white;
  border-radius: 8px;
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
}

.product-card:hover .image {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #f44336;
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
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #333;
  line-height: 1.3;
}

.product-description {
  font-size: 0.875rem;
  color: #666;
  margin: 0 0 1rem 0;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  display: -moz-box;
  display: box;
  -webkit-line-clamp: 2;
  -moz-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  -moz-box-orient: vertical;
  box-orient: vertical;
  line-height: 1.4;
}

.product-price {
  margin-bottom: 1rem;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #f44336;
}

.original-price {
  font-size: 0.875rem;
  color: #999;
  text-decoration: line-through;
}

.product-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
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
  width: 32px;
  height: 32px;
  border: none;
  background-color: #f5f5f5;
  cursor: pointer;
  font-size: 1rem;
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
  width: 40px;
  text-align: center;
  font-size: 0.875rem;
}

.add-to-cart-btn {
  flex: 1;
  padding: 0.75rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.add-to-cart-btn:hover {
  background-color: #45a049;
}

@media (max-width: 1024px) {
  .product-info {
    padding: 0.875rem;
  }

  .product-name {
    font-size: 0.9375rem;
  }

  .product-description {
    font-size: 0.8125rem;
  }

  .price {
    font-size: 1.1875rem;
  }

  .add-to-cart-btn {
    padding: 0.625rem;
    font-size: 0.8125rem;
  }
}

@media (max-width: 768px) {
  .product-info {
    padding: 0.75rem;
  }

  .product-name {
    font-size: 0.875rem;
  }

  .product-description {
    font-size: 0.75rem;
  }

  .price {
    font-size: 1.125rem;
  }

  .product-actions {
    gap: 0.5rem;
  }

  .quantity-control {
    flex-shrink: 1;
  }

  .quantity-btn {
    width: 28px;
    height: 28px;
  }

  .quantity {
    width: 36px;
  }

  .add-to-cart-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .product-info {
    padding: 0.625rem;
  }

  .product-name {
    font-size: 0.8125rem;
  }

  .product-description {
    font-size: 0.6875rem;
  }

  .price {
    font-size: 1.0625rem;
  }

  .product-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .quantity-control {
    justify-content: center;
  }

  .add-to-cart-btn {
    padding: 0.625rem;
    font-size: 0.8125rem;
  }
}
</style>
