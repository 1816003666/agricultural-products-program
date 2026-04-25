<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { couponAPI } from "../services/api";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const router = useRouter();
const myCoupons = ref([]);
const loading = ref(false);
const error = ref("");
const showClaimModal = ref(false);
const claimCode = ref("");
const claimLoading = ref(false);

const fetchMyCoupons = async () => {
  try {
    loading.value = true;
    const response = await couponAPI.getUserCoupons();
    myCoupons.value = response.userCoupons || [];
  } catch (err) {
    console.error("获取优惠券列表失败:", err);
    error.value = "获取优惠券列表失败";
  } finally {
    loading.value = false;
  }
};

const getCouponStatus = (coupon) => {
  if (coupon.status === "used") return "已使用";
  if (coupon.status === "expired") return "已过期";

  const now = new Date();
  const endDate = new Date(coupon.Coupon.end_date);
  if (now > endDate) return "已过期";

  return "未使用";
};

const getCouponStatusClass = (coupon) => {
  const status = getCouponStatus(coupon);
  if (status === "已使用") return "used";
  if (status === "已过期") return "expired";
  return "unused";
};

const handleClaimByCode = async () => {
  if (!claimCode.value.trim()) {
    alert("请输入优惠券码");
    return;
  }

  try {
    claimLoading.value = true;
    await couponAPI.claimCouponByCode(claimCode.value.trim());
    alert("领取成功");
    showClaimModal.value = false;
    claimCode.value = "";
    await fetchMyCoupons();
  } catch (err) {
    console.error("领取优惠券失败:", err);
    alert(err.response?.data?.message || "领取失败，请检查优惠券码是否正确");
  } finally {
    claimLoading.value = false;
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("zh-CN");
};

const formatDiscount = (coupon) => {
  if (coupon.Coupon.type === "percentage") {
    return coupon.Coupon.value + "% OFF";
  } else {
    return "¥" + coupon.Coupon.value;
  }
};

onMounted(async () => {
  await fetchMyCoupons();
});
</script>

<template>
  <div class="coupons-page">
    <Navbar />

    <main class="coupons-main">
      <div class="container">
        <div class="page-header">
          <h1>我的优惠券</h1>
          <button class="claim-btn" @click="showClaimModal = true">
            领取优惠券
          </button>
        </div>

        <div v-if="loading" class="loading">加载中...</div>

        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-else class="coupons-container">
          <div v-if="myCoupons.length === 0" class="empty-coupons">
            <div class="empty-icon">🎫</div>
            <p>暂无优惠券</p>
            <button class="claim-btn" @click="showClaimModal = true">
              去领取
            </button>
          </div>

          <div v-else class="coupons-list">
            <div
              v-for="item in myCoupons"
              :key="item.id"
              class="coupon-item"
              :class="getCouponStatusClass(item)"
            >
              <div class="coupon-left">
                <div class="coupon-value">
                  {{ formatDiscount(item) }}
                </div>
                <div class="coupon-name">{{ item.Coupon.name }}</div>
              </div>
              <div class="coupon-right">
                <div class="coupon-info">
                  <div class="coupon-code">券码: {{ item.Coupon.code }}</div>
                  <div class="coupon-condition">
                    满{{ item.Coupon.min_amount }}元可用
                  </div>
                  <div class="coupon-date">
                    有效期至: {{ formatDate(item.Coupon.end_date) }}
                  </div>
                </div>
                <div class="coupon-status" :class="getCouponStatusClass(item)">
                  {{ getCouponStatus(item) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />

    <!-- 领取优惠券弹窗 -->
    <div
      v-if="showClaimModal"
      class="modal-overlay"
      @click="showClaimModal = false"
    >
      <div class="claim-modal" @click.stop>
        <div class="modal-header">
          <h2>领取优惠券</h2>
          <button class="close-btn" @click="showClaimModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="claim-form">
            <label>请输入优惠券码:</label>
            <input
              v-model="claimCode"
              type="text"
              placeholder="输入优惠券码"
              class="claim-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showClaimModal = false">
            取消
          </button>
          <button
            class="submit-btn"
            @click="handleClaimByCode"
            :disabled="claimLoading"
          >
            {{ claimLoading ? "领取中..." : "立即领取" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coupons-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.coupons-main {
  flex: 1;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.loading,
.error-message,
.empty-coupons {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading {
  color: #666;
}

.error-message {
  color: #f44336;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-coupons p {
  color: #666;
  margin-bottom: 20px;
}

.claim-btn {
  padding: 12px 24px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.claim-btn:hover {
  background-color: #f57c00;
}

.coupons-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.coupons-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.coupon-item {
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.coupon-item.unused {
  border-color: #ff9800;
}

.coupon-item.used {
  border-color: #999;
  opacity: 0.6;
}

.coupon-item.expired {
  border-color: #999;
  opacity: 0.6;
}

.coupon-left {
  width: 180px;
  padding: 20px;
  background: linear-gradient(135deg, #ff9800, #ff5722);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.coupon-item.used .coupon-left,
.coupon-item.expired .coupon-left {
  background: linear-gradient(135deg, #999, #666);
}

.coupon-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.coupon-name {
  font-size: 14px;
  text-align: center;
}

.coupon-right {
  flex: 1;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-info {
  flex: 1;
}

.coupon-code {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.coupon-condition {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.coupon-date {
  font-size: 12px;
  color: #999;
}

.coupon-status {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.coupon-status.unused {
  background-color: #ffebee;
  color: #ff9800;
}

.coupon-status.used {
  background-color: #e0e0e0;
  color: #666;
}

.coupon-status.expired {
  background-color: #e0e0e0;
  color: #999;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.claim-modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.claim-form label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.claim-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.claim-input:focus {
  outline: none;
  border-color: #ff9800;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
}

.cancel-btn,
.submit-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.submit-btn {
  background-color: #ff9800;
  color: white;
}

.submit-btn:hover {
  background-color: #f57c00;
}

.submit-btn:disabled {
  background-color: #ffcc80;
  cursor: not-allowed;
}

@media (max-width: 500px) {
  .coupon-item {
    flex-direction: column;
  }

  .coupon-left {
    width: 100%;
    padding: 16px;
  }

  .coupon-right {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
