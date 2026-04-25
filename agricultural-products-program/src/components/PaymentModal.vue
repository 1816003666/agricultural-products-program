<script setup>
import { ref, onMounted } from "vue";
import { paymentAPI } from "../services/api";

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "payment-success"]);

const paymentMethods = ref([]);
const selectedMethod = ref(null);
const loading = ref(false);
const paymentStatus = ref({
  status: "pending",
  message: "请选择支付方式",
});

// 获取支付方式
const fetchPaymentMethods = async () => {
  try {
    const response = await paymentAPI.getPaymentMethods();
    paymentMethods.value = response.data || [];
    if (paymentMethods.value.length > 0) {
      selectedMethod.value = paymentMethods.value[0].id;
    }
  } catch (error) {
    console.error("获取支付方式失败:", error);
  }
};

// 处理支付
const handlePayment = async () => {
  if (!selectedMethod.value) {
    alert("请选择支付方式");
    return;
  }

  loading.value = true;
  paymentStatus.value = {
    status: "processing",
    message: "正在处理支付...",
  };

  try {
    const response = await paymentAPI.createPayment({
      order_id: props.order.id,
      payment_method: selectedMethod.value,
      amount: props.order.total_amount,
    });

    // 模拟支付过程
    setTimeout(async () => {
      // 查询支付状态
      const statusResponse = await paymentAPI.getPaymentStatus(props.order.id);
      paymentStatus.value = {
        status: statusResponse.data.status,
        message: statusResponse.data.message,
      };

      if (statusResponse.data.status === "paid") {
        emit("payment-success");
        setTimeout(() => {
          emit("close");
        }, 1500);
      }

      loading.value = false;
    }, 3000);
  } catch (error) {
    console.error("支付失败:", error);
    paymentStatus.value = {
      status: "error",
      message: "支付失败，请稍后重试",
    };
    loading.value = false;
  }
};

const handleClose = () => {
  emit("close");
};

onMounted(() => {
  if (props.visible) {
    fetchPaymentMethods();
  }
});
</script>

<template>
  <div v-if="visible" class="payment-modal">
    <div class="payment-container">
      <div class="payment-header">
        <h2 class="payment-title">选择支付方式</h2>
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

      <div class="payment-content">
        <div class="order-info">
          <div class="order-item">
            <span class="label">订单编号:</span>
            <span class="value">{{ order.id }}</span>
          </div>
          <div class="order-item">
            <span class="label">订单金额:</span>
            <span class="value price">¥{{ order.total_amount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="payment-methods">
          <h3 class="section-title">选择支付方式</h3>
          <div class="methods-list">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="method-item"
              :class="{ active: selectedMethod === method.id }"
              @click="selectedMethod = method.id"
            >
              <span class="method-icon">{{ method.icon }}</span>
              <span class="method-name">{{ method.name }}</span>
              <div class="method-radio" :class="{ checked: selectedMethod === method.id }"></div>
            </div>
          </div>
        </div>

        <div class="payment-status" :class="paymentStatus.status">
          <div v-if="paymentStatus.status === 'processing'" class="loading-spinner"></div>
          <span>{{ paymentStatus.message }}</span>
        </div>
      </div>

      <div class="payment-actions">
        <button class="cancel-btn" @click="handleClose" :disabled="loading">
          取消
        </button>
        <button class="pay-btn" @click="handlePayment" :disabled="loading || !selectedMethod">
          {{ loading ? '处理中...' : '确认支付' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-modal {
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

.payment-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.payment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.payment-title {
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

.payment-content {
  padding: 1.5rem;
}

.order-info {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.order-item:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 0.875rem;
  color: #666;
}

.value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.value.price {
  color: #ff6b35;
  font-weight: bold;
  font-size: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.methods-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.method-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  gap: 1rem;
}

.method-item:hover {
  border-color: #2eac70;
  box-shadow: 0 2px 8px rgba(46, 172, 112, 0.1);
}

.method-item.active {
  border-color: #2eac70;
  background-color: rgba(46, 172, 112, 0.05);
}

.method-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.method-name {
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #333;
}

.method-radio {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
}

.method-radio.checked {
  border-color: #2eac70;
  background-color: #2eac70;
}

.method-radio.checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background-color: white;
  border-radius: 50%;
}

.payment-status {
  margin: 1.5rem 0;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.payment-status.processing {
  background-color: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.payment-status.error {
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.payment-status.success {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.payment-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
  background-color: #f9f9f9;
}

.cancel-btn {
  flex: 1;
  padding: 0.75rem;
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.pay-btn {
  flex: 1;
  padding: 0.75rem;
  background-color: #2eac70;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.3s;
}

.pay-btn:hover {
  background-color: #289e63;
}

.pay-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 500px) {
  .payment-container {
    max-width: 100%;
  }

  .payment-header,
  .payment-content,
  .payment-actions {
    padding: 1rem;
  }
}
</style>
