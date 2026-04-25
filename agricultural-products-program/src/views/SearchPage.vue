<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { productAPI } from "../services/api";
import ProductCard from "../components/ProductCard.vue";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const route = useRoute();
const router = useRouter();

const searchQuery = ref("");
const products = ref([]);
const loading = ref(false);
const cartCount = ref(0);

const defaultProducts = [
  { id: 1, name: "山东红富士苹果 5斤装 脆甜多汁", price: 12.99, originalPrice: 19.99, image: "https://img.freepik.com/free-photo/red-apple_1339-862.jpg", sold: 1256, discount: 35, tag: "热销爆款" },
  { id: 2, name: "云南高原草莓 2斤装 新鲜直达", price: 29.99, originalPrice: 39.99, image: "https://img.freepik.com/free-photo/strawberry_1339-1032.jpg", sold: 896, discount: 25, tag: "限时优惠" },
  { id: 3, name: "有机生菜 500g 新鲜采摘", price: 6.99, originalPrice: 9.99, image: "https://img.freepik.com/free-photo/lettuce_1339-1034.jpg", sold: 2341, discount: 30, tag: "有机蔬菜" },
  { id: 4, name: "农家散养土鸡蛋 30枚 营养丰富", price: 45.99, originalPrice: 59.99, image: "https://img.freepik.com/free-photo/eggs_1339-1023.jpg", sold: 2156, discount: 23, tag: "热销爆款" },
  { id: 5, name: "鲜活大闸蟹 4只 膏满黄肥", price: 128.99, originalPrice: 168.99, image: "https://img.freepik.com/free-photo/crab_1339-1030.jpg", sold: 765, discount: 24, tag: "鲜活水产" },
  { id: 6, name: "五常大米 5kg 优质稻米", price: 42.99, originalPrice: 58.99, image: "https://img.freepik.com/free-photo/rice_1339-1005.jpg", sold: 3456, discount: 27, tag: "热销粮油" },
  { id: 7, name: "新疆核桃 500g 补脑健脑", price: 32.99, originalPrice: 45.99, image: "https://img.freepik.com/free-photo/walnut_1339-1013.jpg", sold: 1876, discount: 28, tag: "坚果炒货" },
  { id: 8, name: "南美对虾 500g 冰鲜直达", price: 48.99, originalPrice: 65.99, image: "https://img.freepik.com/free-photo/shrimp_1339-1031.jpg", sold: 2134, tag: "冰鲜水产" },
];

const filteredProducts = computed(() => {
  if (!searchQuery.value) {
    return products.value;
  }
  const query = searchQuery.value.toLowerCase();
  return products.value.filter((p) =>
    p.name.toLowerCase().includes(query)
  );
});

const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await productAPI.getProducts();
    if (Array.isArray(response) && response.length > 0) {
      products.value = response.map((p) => ({
        ...p,
        tag: p.discount ? "限时优惠" : p.sold > 500 ? "热销爆款" : "精选推荐",
      }));
    } else {
      products.value = [...defaultProducts];
    }
  } catch (error) {
    console.log("使用默认产品数据");
    products.value = [...defaultProducts];
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  console.log("搜索:", searchQuery.value);
};

const handleAddToCart = (product) => {
  alert(`已将 ${product.name} 添加到购物车`);
};

const handleViewDetail = (product) => {
  console.log("查看商品详情:", product);
};

const handleOpenCart = () => {
  console.log("打开购物车");
};

onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q;
  }
  fetchProducts();
});
</script>

<template>
  <div class="search-page">
    <Navbar
      :cart-count="cartCount"
      @open-cart="handleOpenCart"
      @search="handleSearch"
    />

    <main class="main">
      <div class="search-container">
        <div class="search-header">
          <h1 class="search-title">商品搜索</h1>
          <div class="search-box">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="搜索商品..."
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <div class="search-icon" @click="handleSearch">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="search-results" v-if="!loading">
          <p class="results-count" v-if="searchQuery">
            找到 <strong>{{ filteredProducts.length }}</strong> 件商品
          </p>
          <div class="product-grid" v-if="filteredProducts.length > 0">
            <ProductCard
              v-for="product in filteredProducts"
              :key="product.id"
              :product="product"
              @add-to-cart="handleAddToCart"
              @view-detail="handleViewDetail"
            />
          </div>
          <div class="no-results" v-else>
            <p>未找到相关商品</p>
          </div>
        </div>

        <div class="loading" v-else>
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.search-page {
  min-height: 100vh;
  background-color: #f7f8f9;
}

.main {
  flex: 1;
  width: 100%;
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  box-sizing: border-box;
}

.search-header {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
  background-color: #f7f8f9;
  border-radius: 25px;
  padding: 0.5rem 1rem;
}

.search-input {
  flex: 1;
  padding: 0.5rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  outline: none;
}

.search-icon {
  cursor: pointer;
  color: #2eac70;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s;
}

.search-icon:hover {
  background-color: rgba(46, 172, 112, 0.1);
}

.search-btn {
  padding: 0.875rem 2rem;
  background-color: #2eac70;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
}

.search-btn:hover {
  background-color: #289e63;
}

.search-results {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.results-count {
  font-size: 0.9375rem;
  color: #666;
  margin: 0 0 1.5rem 0;
}

.results-count strong {
  color: #2eac70;
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.product-grid > * {
  flex: 0 0 calc(25% - 1.125rem);
  max-width: calc(25% - 1.125rem);
  box-sizing: border-box;
}

.no-results {
  text-align: center;
  padding: 4rem;
  color: #999;
}

.no-results p {
  font-size: 1.125rem;
  margin: 0;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background-color: white;
  border-radius: 12px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2eac70;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .product-grid > * {
    flex: 0 0 calc(33.333% - 1rem);
    max-width: calc(33.333% - 1rem);
  }
}

@media (max-width: 500px) {
  .search-header {
    padding: 1.5rem;
  }

  .search-title {
    font-size: 1.25rem;
  }

  .search-box {
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
  }

  .product-grid > * {
    flex: 0 0 calc(50% - 0.75rem);
    max-width: calc(50% - 0.75rem);
  }
}

@media (max-width: 480px) {
  .search-container {
    padding: 1rem 0.5rem;
  }

  .search-header {
    padding: 1rem;
  }

  .product-grid > * {
    flex: 0 0 calc(50% - 0.5rem);
    max-width: calc(50% - 0.5rem);
  }
}
</style>
