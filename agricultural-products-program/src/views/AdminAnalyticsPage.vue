<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { orderAPI, productAPI, userAPI } from "../services/api";
import Chart from "chart.js/auto";

const salesData = ref([]);
const userData = ref([]);
const productData = ref([]);
const orderStatusData = ref([]);
const salesChannelData = ref([]);
const monthlySalesData = ref([]);
const categorySalesData = ref([]);
const loading = ref(false);
const error = ref("");
const salesChart = ref(null);
const userChart = ref(null);
const productChart = ref(null);
const orderStatusChart = ref(null);
const salesChannelChart = ref(null);
const monthlySalesChart = ref(null);
const categorySalesChart = ref(null);

// 计算总销售额
const totalSales = computed(() => {
  return salesData.value.reduce((total, item) => total + (item.amount || 0), 0);
});

// 计算总订单数
const totalOrders = computed(() => {
  return salesData.value.length;
});

// 计算总用户数
const totalUsers = computed(() => {
  return userData.value.length;
});

// 计算总产品数
const totalProducts = computed(() => {
  return productData.value.length;
});

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

// 模拟获取订单状态分布数据
const fetchOrderStatusData = () => {
  orderStatusData.value = [
    { status: "待付款", count: 15 },
    { status: "已发货", count: 45 },
    { status: "已收货", count: 80 },
    { status: "已退款", count: 10 },
  ];
};

// 模拟获取销售渠道数据
const fetchSalesChannelData = () => {
  salesChannelData.value = [
    { channel: "网站", count: 100 },
    { channel: "APP", count: 60 },
    { channel: "微信小程序", count: 40 },
    { channel: "其他", count: 10 },
  ];
};

// 模拟获取月度销售数据
const fetchMonthlySalesData = () => {
  monthlySalesData.value = [
    { month: "1月", amount: 5000 },
    { month: "2月", amount: 7000 },
    { month: "3月", amount: 9000 },
    { month: "4月", amount: 6000 },
    { month: "5月", amount: 8000 },
    { month: "6月", amount: 12000 },
  ];
};

// 模拟获取分类销售数据
const fetchCategorySalesData = () => {
  categorySalesData.value = [
    { category: "水果", amount: 15000 },
    { category: "蔬菜", amount: 12000 },
    { category: "肉禽蛋", amount: 18000 },
    { category: "水产", amount: 8000 },
    { category: "粮油", amount: 10000 },
    { category: "干货", amount: 5000 },
  ];
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

// 渲染订单状态分布图表
const renderOrderStatusChart = () => {
  try {
    const ctx = document.getElementById("orderStatusChart");
    if (!ctx) return;

    // 确保canvas元素存在且可用
    if (!ctx.getContext) return;

    // 销毁之前的图表实例
    if (orderStatusChart.value) {
      try {
        orderStatusChart.value.destroy();
      } catch (err) {
        console.error("销毁订单状态图表失败:", err);
      }
      orderStatusChart.value = null;
    }

    // 处理订单状态数据
    const labels = orderStatusData.value.map((item) => item.status);
    const data = orderStatusData.value.map((item) => item.count);

    // 创建新的图表实例
    orderStatusChart.value = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ["#ff9800", "#4caf50", "#2196f3", "#f44336"],
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
            text: "订单状态分布",
          },
        },
      },
    });
  } catch (error) {
    console.error("渲染订单状态图表失败:", error);
  }
};

// 渲染销售渠道分析图表
const renderSalesChannelChart = () => {
  try {
    const ctx = document.getElementById("salesChannelChart");
    if (!ctx) return;

    // 确保canvas元素存在且可用
    if (!ctx.getContext) return;

    // 销毁之前的图表实例
    if (salesChannelChart.value) {
      try {
        salesChannelChart.value.destroy();
      } catch (err) {
        console.error("销毁销售渠道图表失败:", err);
      }
      salesChannelChart.value = null;
    }

    // 处理销售渠道数据
    const labels = salesChannelData.value.map((item) => item.channel);
    const data = salesChannelData.value.map((item) => item.count);

    // 创建新的图表实例
    salesChannelChart.value = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ["#4caf50", "#2196f3", "#ff9800", "#9c27b0"],
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
            text: "销售渠道分析",
          },
        },
      },
    });
  } catch (error) {
    console.error("渲染销售渠道图表失败:", error);
  }
};

// 渲染月度销售趋势图表
const renderMonthlySalesChart = () => {
  try {
    const ctx = document.getElementById("monthlySalesChart");
    if (!ctx) return;

    // 确保canvas元素存在且可用
    if (!ctx.getContext) return;

    // 销毁之前的图表实例
    if (monthlySalesChart.value) {
      try {
        monthlySalesChart.value.destroy();
      } catch (err) {
        console.error("销毁月度销售图表失败:", err);
      }
      monthlySalesChart.value = null;
    }

    // 处理月度销售数据
    const labels = monthlySalesData.value.map((item) => item.month);
    const data = monthlySalesData.value.map((item) => item.amount);

    // 创建新的图表实例
    monthlySalesChart.value = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "销售额",
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
            text: "月度销售趋势",
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
              text: "月份",
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("渲染月度销售图表失败:", error);
  }
};

// 渲染分类销售数据图表
const renderCategorySalesChart = () => {
  try {
    const ctx = document.getElementById("categorySalesChart");
    if (!ctx) return;

    // 确保canvas元素存在且可用
    if (!ctx.getContext) return;

    // 销毁之前的图表实例
    if (categorySalesChart.value) {
      try {
        categorySalesChart.value.destroy();
      } catch (err) {
        console.error("销毁分类销售图表失败:", err);
      }
      categorySalesChart.value = null;
    }

    // 处理分类销售数据
    const labels = categorySalesData.value.map((item) => item.category);
    const data = categorySalesData.value.map((item) => item.amount);

    // 创建新的图表实例
    categorySalesChart.value = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "销售额",
            data: data,
            backgroundColor: "#4caf50",
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
            text: "分类销售排行",
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
              text: "分类",
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("渲染分类销售图表失败:", error);
  }
};

const renderCharts = () => {
  // 确保DOM元素已经加载
  if (document.readyState === "complete") {
    renderSalesChart();
    renderUserChart();
    renderProductChart();
    renderOrderStatusChart();
    renderSalesChannelChart();
    renderMonthlySalesChart();
    renderCategorySalesChart();
  } else {
    window.addEventListener("load", () => {
      renderSalesChart();
      renderUserChart();
      renderProductChart();
      renderOrderStatusChart();
      renderSalesChannelChart();
      renderMonthlySalesChart();
      renderCategorySalesChart();
    });
  }
};

onMounted(async () => {
  await fetchSalesData();
  await fetchUserData();
  await fetchProductData();
  // 获取模拟数据
  fetchOrderStatusData();
  fetchSalesChannelData();
  fetchMonthlySalesData();
  fetchCategorySalesData();
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
    if (orderStatusChart.value) {
      orderStatusChart.value.destroy();
      orderStatusChart.value = null;
    }
    if (salesChannelChart.value) {
      salesChannelChart.value.destroy();
      salesChannelChart.value = null;
    }
    if (monthlySalesChart.value) {
      monthlySalesChart.value.destroy();
      monthlySalesChart.value = null;
    }
    if (categorySalesChart.value) {
      categorySalesChart.value.destroy();
      categorySalesChart.value = null;
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
          <div class="card-value">{{ totalOrders }}</div>
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
            ¥{{ totalSales.toFixed(2) }}
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
          <div class="card-value">{{ totalUsers }}</div>
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
          <div class="card-value">{{ totalProducts }}</div>
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

      <div class="section">
        <h3>订单状态分布</h3>
        <div class="chart-container">
          <canvas id="orderStatusChart"></canvas>
        </div>
      </div>

      <div class="section">
        <h3>销售渠道分析</h3>
        <div class="chart-container">
          <canvas id="salesChannelChart"></canvas>
        </div>
      </div>

      <div class="section">
        <h3>月度销售趋势</h3>
        <div class="chart-container">
          <canvas id="monthlySalesChart"></canvas>
        </div>
      </div>

      <div class="section">
        <h3>分类销售排行</h3>
        <div class="chart-container">
          <canvas id="categorySalesChart"></canvas>
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
