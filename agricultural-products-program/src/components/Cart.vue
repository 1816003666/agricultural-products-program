<script setup>
import { ref, computed } from "vue";
import { orderAPI, authAPI } from "../services/api";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:items", "close"]);

const handleQuantityChange = (item, delta) => {
  const updatedItems = props.items.map((cartItem) => {
    if (cartItem.id === item.id) {
      const newQuantity = (Number(cartItem.quantity) || 0) + delta;
      return newQuantity >= 1
        ? { ...cartItem, quantity: newQuantity }
        : cartItem;
    }
    return cartItem;
  });
  emit("update:items", updatedItems);
};

const handleRemoveItem = (item) => {
  const updatedItems = props.items.filter(
    (cartItem) => cartItem.id !== item.id,
  );
  emit("update:items", updatedItems);
};

const totalPrice = computed(() => {
  return props.items.reduce((total, item) => {
    return (
      total +
      (Number(item.Product?.price || item.price) || 0) *
        (Number(item.quantity) || 0)
    );
  }, 0);
});

const totalItems = computed(() => {
  return props.items.reduce((total, item) => {
    return total + (Number(item.quantity) || 0);
  }, 0);
});

const handleCheckout = async () => {
  // 检查用户是否已登录
  const token = localStorage.getItem("token");
  if (!token) {
    alert("请先登录");
    return;
  }

  try {
    // 准备订单数据
    const orderData = {
      items: props.items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.Product?.price || item.price,
      })),
      total_amount: totalPrice.value,
    };

    // 创建订单
    const response = await orderAPI.createOrder(orderData);
    console.log("订单创建成功:", response);

    // 清空购物车
    emit("update:items", []);

    // 跳转到个人中心页面
    window.location.href = "/profile";
  } catch (error) {
    console.error("结算失败:", error);
    alert("结算失败，请稍后重试");
  }
};

const handleClose = () => {
  emit("close");
};
</script>

<template>
  <div class="cart">
    <div class="cart-container">
      <div class="cart-header">
        <h2 class="cart-title">购物车</h2>
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
      </div>

      <div class="cart-content">
        <div v-if="items.length === 0" class="empty-cart">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 18C7 19.1046 6.10457 20 5 20C3.89543 20 3 19.1046 3 18C3 16.8954 3.89543 16 5 16C6.10457 16 7 16.8954 7 18Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M17 18C17 19.1046 16.1046 20 15 20C13.8954 20 13 19.1046 13 18C13 16.8954 13.8954 16 15 16C16.1046 16 17 16.8954 17 18Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3 6H21"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M16 6V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M15 12H9"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p>购物车是空的</p>
          <button class="continue-shopping" @click="handleClose">
            继续购物
          </button>
        </div>

        <div v-else class="cart-items">
          <div v-for="item in items" :key="item.id" class="cart-item">
            <div class="item-image">
              <img
                :src="item.Product?.image || item.image"
                :alt="item.Product?.name || item.name"
                class="image"
              />
            </div>

            <div class="item-info">
              <h3 class="item-name">{{ item.Product?.name || item.name }}</h3>
              <p class="item-price">
                ¥{{
                  (Number(item.Product?.price || item.price) || 0).toFixed(2)
                }}
              </p>
            </div>

            <div class="item-quantity">
              <div class="quantity-control">
                <button
                  class="quantity-btn"
                  @click="handleQuantityChange(item, -1)"
                  :disabled="item.quantity <= 1"
                >
                  -
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button
                  class="quantity-btn"
                  @click="handleQuantityChange(item, 1)"
                >
                  +
                </button>
              </div>
            </div>

            <div class="item-total">
              <span class="total-price"
                >¥{{
                  (
                    (Number(item.Product?.price || item.price) || 0) *
                    (Number(item.quantity) || 0)
                  ).toFixed(2)
                }}</span
              >
            </div>

            <button class="remove-btn" @click="handleRemoveItem(item)">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 6H21"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="items.length > 0" class="cart-summary">
        <div class="summary-item">
          <span class="summary-label">商品数量:</span>
          <span class="summary-value">{{ totalItems }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">商品总价:</span>
          <span class="summary-value total">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
        <button class="checkout-btn" @click="handleCheckout">去结算</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  z-index: 2000;
}

.cart-container {
  background-color: white;
  border-radius: 8px 0 0 8px;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 450px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.cart-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #333;
}

.cart-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
}

.empty-cart svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-cart p {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

.continue-shopping {
  padding: 0.75rem 1.5rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.3s;
}

.continue-shopping:hover {
  background-color: #45a049;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr 100px 100px 40px;
  gap: 1rem;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.item-price {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.item-quantity {
  display: flex;
  justify-content: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
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

.item-total {
  display: flex;
  justify-content: flex-end;
}

.total-price {
  font-size: 0.875rem;
  font-weight: 500;
  color: #f44336;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  color: #f44336;
}

.cart-summary {
  padding: 1.5rem;
  border-top: 1px solid #eee;
  background-color: #f9f9f9;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.summary-label {
  font-size: 0.875rem;
  color: #666;
}

.summary-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.summary-value.total {
  font-size: 1.125rem;
  color: #f44336;
  font-weight: bold;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.3s;
  margin-top: 0.5rem;
}

.checkout-btn:hover {
  background-color: #45a049;
}

@media (max-width: 768px) {
  .cart-container {
    max-width: 100%;
  }

  .cart-item {
    grid-template-columns: 60px 1fr 80px 80px 30px;
    gap: 0.75rem;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }

  .cart-header,
  .cart-content,
  .cart-summary {
    padding: 1rem;
  }
}
</style>
