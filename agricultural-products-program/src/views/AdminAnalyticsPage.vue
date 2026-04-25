<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { orderAPI, productAPI, userAPI } from "../services/api";
import Chart from "chart.js/auto";

const salesData = ref([]);
const userData = ref([]);
const productData = ref([]);
const loading = ref(false);
const error = ref("");
const salesChart = ref(null);
const userChart = ref(null);
const productChart = ref(null);

const fetchSalesData = async () => {
  try {
    loading.value = true;
    const response = await orderAPI.getSalesData();
    salesData.value = response.data || [];
  } catch (err) {
    error.value = "获取销售数据失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchUserData = async () => {
  try {
    loading.value = true;
    const response = await userAPI.getUserData();
    userData.value = response.data || [];
  } catch (err) {
    error.value = "获取用户数据失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchProductData = async () => {
  try {
    loading.value = true;
    const response = await productAPI.getProductData();
    productData.value = response.data || [];
  } catch (err) {
    error.value = "获取产品数据失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const renderSalesChart = () => {
  try {
    const ctx = document.getElementById("salesChart");
    if (!ctx) return;

    // 确保canvas元素存在且可用
    if (!ctx.getContext) return;

    // 销毁之前的图表实例
    if (salesChart.value) {
      try {
        salesChart.value.destroy();
      } catch (err) {
        console.error("销毁销售图表失败:", err);
      }
      salesChart.value = null;
    }

    // 处理销售数据
    const labels = salesData.value.map((item) =>
      new Date(item.date).toLocaleDateString(),
    );
    const data = salesData.value.map((item) => item.amount);

    // 创建新的图表实例
    salesChart.value = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "销售额",
            data: data,
            borderColor: "#4caf50",
            backgroundColor: "rgba(76, 175, 80, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "销售趋势",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "金额 (¥)",
            },
          },
          x: {
            title: {
              display: true,
              text: "日期",
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("渲染销售图表失败:", error);
  }
};

const renderUserChart = () => {
  try {
    const ctx = document.getElementById("userChart");
    if (!ctx) return;

    // 确保canvas元素存在且可用
    if (!ctx.getContext) return;

    // 销毁之前的图表实例
    if (userChart.value) {
      try {
        userChart.value.destroy();
      } catch (err) {
        console.error("销毁用户图表失败:", err);
      }
      userChart.value = null;
    }

    // 处理用户数据
    const labels = userData.value.map((item) =>
      new Date(item.date).toLocaleDateString(),
    );
    const data = userData.value.map((item) => item.count);

    // 创建新的图表实例
    userChart.value = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "用户数",
            data: data,
            borderColor: "#2196f3",
            backgroundColor: "rgba(33, 150, 243, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "用户增长",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "用户数",
            },
          },
          x: {
            title: {
              display: true,
              text: "日期",
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("渲染用户图表失败:", error);
  }
};

const renderProductChart = () => {
  try {
    const ctx = document.getElementById("productChart");
    if (!ctx) return;

    // 确保canvas元素存在且可用
    if (!ctx.getContext) return;

    // 销毁之前的图表实例
    if (productChart.value) {
      try {
        productChart.value.destroy();
      } catch (err) {
        console.error("销毁产品图表失败:", err);
      }
      productChart.value = null;
    }

    // 处理产品数据
    const labels = productData.value.map((item) => item.name);
    const data = productData.value.map((item) => item.sold);

    // 创建新的图表实例
    productChart.value = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "销量",
            data: data,
            backgroundColor: "#ff9800",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "产品销售排行",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "销量",
            },
          },
          x: {
            title: {
              display: true,
              text: "产品",
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("渲染产品图表失败:", error);
  }
};

const renderCharts = () => {
  // 确保DOM元素已经加载
  if (document.readyState === "complete") {
    renderSalesChart();
    renderUserChart();
    renderProductChart();
  } else {
    window.addEventListener("load", () => {
      renderSalesChart();
      renderUserChart();
      renderProductChart();
    });
  }
};

onMounted(async () => {
  await fetchSalesData();
  await fetchUserData();
  await fetchProductData();
  // 延迟渲染图表，确保DOM元素已经加载
  setTimeout(renderCharts, 100);
});

onUnmounted(() => {
  // 销毁图表实例
  try {
    if (salesChart.value) {
      salesChart.value.destroy();
      salesChart.value = null;
    }
    if (userChart.value) {
      userChart.value.destroy();
      userChart.value = null;
    }
    if (productChart.value) {
      productChart.value.destroy();
      productChart.value = null;
    }
  } catch (error) {
    console.error("销毁图表实例失败:", error);
  }
});
</script>

<template>
  <div class="main-content">
    <div class="header">
      <h2>数据分析</h2>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="analytics-cards">
      <div class="card">
        <div class="card-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="card-content">
          <div class="card-title">总订单</div>
          <div class="card-value">{{ salesData.length }}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="card-content">
          <div class="card-title">总销售额</div>
          <div class="card-value">
            ¥{{ salesData.reduce((total, item) => total + item.amount, 0) }}
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle
              cx="9"
              cy="7"
              r="4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M23 21v-2a4 4 0 0 0-3-3.87"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M16 3.13a4 4 0 0 1 0 7.75"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="card-content">
          <div class="card-title">总用户</div>
          <div class="card-value">{{ userData.length }}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 7H4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M16 17H4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 22H4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8 2H4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M16 12H8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M20 17H16"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M20 12H16"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 17H8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 2H8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 12H8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="card-content">
          <div class="card-title">总产品</div>
          <div class="card-value">{{ productData.length }}</div>
        </div>
      </div>
    </div>

    <div class="analytics-sections">
      <div class="section">
        <h3>销售趋势</h3>
        <div class="chart-container">
          <canvas id="salesChart"></canvas>
        </div>
      </div>

      <div class="section">
        <h3>用户增长</h3>
        <div class="chart-container">
          <canvas id="userChart"></canvas>
        </div>
      </div>

      <div class="section">
        <h3>产品销售排行</h3>
        <div class="chart-container">
          <canvas id="productChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.header {
  margin-bottom: 2rem;
}

.header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.analytics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: #4caf50;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.analytics-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.section {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
}

.chart-container {
  width: 100%;
  height: 300px;
}

@media (max-width: 500px) {
  .admin-page {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    overflow-x: auto;
  }

  .sidebar-header {
    border-bottom: none;
    border-right: 1px solid #444;
  }

  .sidebar-menu {
    display: flex;
    flex: 1;
    padding: 0;
  }

  .menu-item {
    white-space: nowrap;
    border-right: 1px solid #444;
  }

  .analytics-cards {
    grid-template-columns: 1fr;
  }

  .analytics-sections {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 250px;
  }
}
</style>
