<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { logisticsAPI } from "../services/api";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const route = useRoute();
const router = useRouter();
const trackingInfo = ref(null);
const loading = ref(false);
const error = ref("");

const fetchTracking = async () => {
  try {
    loading.value = true;
    const orderId = route.params.id || route.query.orderId;
    if (!orderId) {
      error.value = "订单ID不存在";
      return;
    }
    const response = await logisticsAPI.getTracking(orderId);
    trackingInfo.value = response.tracking;
  } catch (err) {
    console.error("获取物流信息失败:", err);
    error.value = err.response?.data?.message || "获取物流信息失败";
  } finally {
    loading.value = false;
  }
};

const formatTime = (time) => {
  return new Date(time).toLocaleString("zh-CN");
};

onMounted(async () => {
  await fetchTracking();
});
</script>

<template>
  <div class="tracking-page">
    <Navbar />

    <main class="tracking-main">
      <div class="container">
        <div class="page-header">
          <h1>物流跟踪</h1>
          <button class="back-btn" @click="router.back()">返回</button>
        </div>

        <div v-if="loading" class="loading">加载中...</div>

        <div v-else-if="error" class="error-message">
          {{ error }}
          <button class="retry-btn" @click="fetchTracking">重试</button>
        </div>

        <div v-else-if="trackingInfo" class="tracking-container">
          <!-- 物流信息概览 -->
          <div class="tracking-overview">
            <div class="tracking-header">
              <div class="tracking-icon">🚚</div>
              <div class="tracking-status">
                <div class="status-label">{{ trackingInfo.status }}</div>
                <div class="tracking-number">
                  {{ trackingInfo.shippingCompany }}:
                  {{ trackingInfo.trackingNumber }}
                </div>
              </div>
            </div>
            <div class="receiver-info">
              <h3>收货人信息</h3>
              <div class="info-row">
                <span class="label">姓名:</span>
                <span class="value">{{ trackingInfo.receiver?.name }}</span>
              </div>
              <div class="info-row">
                <span class="label">电话:</span>
                <span class="value">{{ trackingInfo.receiver?.phone }}</span>
              </div>
              <div class="info-row">
                <span class="label">地址:</span>
                <span class="value">{{ trackingInfo.receiver?.address }}</span>
              </div>
            </div>
            <div class="current-location">
              <div class="location-label">当前位置:</div>
              <div class="location-value">
                {{ trackingInfo.currentLocation }}
              </div>
            </div>
            <div class="last-update">
              更新时间: {{ formatTime(trackingInfo.lastUpdate) }}
            </div>
            <div
              v-if="trackingInfo.estimatedDelivery"
              class="estimated-delivery"
            >
              预计送达: {{ formatTime(trackingInfo.estimatedDelivery) }}
            </div>
          </div>

          <!-- 物流轨迹 -->
          <div class="tracking-traces">
            <h2>物流轨迹</h2>
            <div class="traces-timeline">
              <div
                v-for="(trace, index) in trackingInfo.traces"
                :key="index"
                class="trace-item"
                :class="{ latest: index === trackingInfo.traces.length - 1 }"
              >
                <div class="trace-dot"></div>
                <div class="trace-content">
                  <div class="trace-time">{{ formatTime(trace.time) }}</div>
                  <div class="trace-status">{{ trace.status }}</div>
                  <div class="trace-location">{{ trace.location }}</div>
                  <div class="trace-description">{{ trace.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.tracking-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.tracking-main {
  flex: 1;
  padding: 20px 0;
}

.container {
  max-width: 800px;
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

.back-btn {
  padding: 10px 20px;
  background-color: #666;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.back-btn:hover {
  background-color: #555;
}

.loading,
.error-message {
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

.retry-btn {
  display: inline-block;
  margin-top: 16px;
  padding: 10px 20px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.tracking-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tracking-overview {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.tracking-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.tracking-icon {
  font-size: 48px;
}

.tracking-status {
  flex: 1;
}

.status-label {
  font-size: 20px;
  font-weight: 600;
  color: #4caf50;
  margin-bottom: 4px;
}

.tracking-number {
  font-size: 14px;
  color: #666;
}

.receiver-info {
  margin-bottom: 20px;
}

.receiver-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-row .label {
  width: 70px;
  color: #666;
}

.info-row .value {
  flex: 1;
  color: #333;
}

.current-location {
  background-color: #e3f2fd;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.location-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.location-value {
  font-size: 16px;
  font-weight: 500;
  color: #1976d2;
}

.last-update {
  font-size: 12px;
  color: #999;
  text-align: right;
}

.estimated-delivery {
  margin-top: 12px;
  padding: 12px;
  background-color: #fff3e0;
  border-radius: 8px;
  font-size: 14px;
  color: #e65100;
  text-align: center;
}

.tracking-traces {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.tracking-traces h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.traces-timeline {
  position: relative;
  padding-left: 30px;
}

.traces-timeline::before {
  content: "";
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e0e0e0;
}

.trace-item {
  position: relative;
  padding-bottom: 24px;
}

.trace-item:last-child {
  padding-bottom: 0;
}

.trace-dot {
  position: absolute;
  left: -26px;
  top: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #e0e0e0;
  border: 2px solid white;
}

.trace-item.latest .trace-dot {
  background-color: #4caf50;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
}

.trace-content {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

.trace-item.latest .trace-content {
  background-color: #e8f5e9;
}

.trace-time {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.trace-status {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.trace-item.latest .trace-status {
  color: #4caf50;
}

.trace-location {
  font-size: 14px;
  color: #1976d2;
  margin-bottom: 4px;
}

.trace-description {
  font-size: 14px;
  color: #666;
}

@media (max-width: 500px) {
  .tracking-header {
    flex-direction: column;
    text-align: center;
  }

  .info-row {
    flex-direction: column;
  }

  .info-row .label {
    width: 100%;
    margin-bottom: 4px;
  }
}
</style>
