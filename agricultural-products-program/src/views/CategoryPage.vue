<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { productAPI } from "../services/api";
import ProductCard from "../components/ProductCard.vue";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const route = useRoute();

const categoryData = {
  fruit: {
    name: "水果",
    icon: "🍎",
    description: "新鲜水果，产地直发",
    bannerColor: "#4CAF50",
    subcategories: [
      { id: "citrus", name: "柑橘类", icon: "🍊" },
      { id: "apple", name: "苹果梨", icon: "🍎" },
      { id: "tropical", name: "热带水果", icon: "🥭" },
      { id: "berries", name: "浆果类", icon: "🍓" },
      { id: "melon", name: "瓜类", icon: "🍉" },
      { id: "grape", name: "葡萄", icon: "🍇" },
    ],
    filters: ["全部", "当季热销", "新品上市", "有机认证", "精选推荐"],
  },
  vegetable: {
    name: "蔬菜",
    icon: "🥬",
    description: "有机蔬菜，新鲜采摘",
    bannerColor: "#8BC34A",
    subcategories: [
      { id: "leafy", name: "叶菜类", icon: "🥬" },
      { id: "root", name: "根茎类", icon: "🥕" },
      { id: "mushroom", name: "菌菇类", icon: "🍄" },
      { id: "sprout", name: "豆芽类", icon: "🫘" },
    ],
    filters: ["全部", "有机蔬菜", "绿色蔬菜", "新品上架", "热销推荐"],
  },
  meat: {
    name: "肉禽蛋",
    icon: "🥩",
    description: "优质肉禽，健康蛋品",
    bannerColor: "#E57373",
    subcategories: [
      { id: "pork", name: "猪肉", icon: "🥓" },
      { id: "beef", name: "牛肉", icon: "🥩" },
      { id: "lamb", name: "羊肉", icon: "🍖" },
      { id: "poultry", name: "禽肉", icon: "🍗" },
      { id: "egg", name: "鸡蛋", icon: "🥚" },
      { id: "duck", name: "鸭蛋", icon: "🦆" },
    ],
    filters: ["全部", "新鲜肉类", "有机蛋类", "进口肉类", "精选肉类"],
  },
  seafood: {
    name: "水产",
    icon: "🐟",
    description: "鲜活水产，冷链配送",
    bannerColor: "#2196F3",
    subcategories: [
      { id: "fish", name: "鱼类", icon: "🐟" },
      { id: "shrimp", name: "虾类", icon: "🦐" },
      { id: "crab", name: "蟹类", icon: "🦀" },
      { id: "shellfish", name: "贝类", icon: "🐚" },
      { id: "squid", name: "鱿鱼类", icon: "🦑" },
    ],
    filters: ["全部", "鲜活水产", "冰鲜水产", "进口海鲜", "海鲜套餐"],
  },
  grain: {
    name: "粮油",
    icon: "🌾",
    description: "优质粮油，放心主食",
    bannerColor: "#FF9800",
    subcategories: [
      { id: "rice", name: "大米", icon: "🍚" },
      { id: "flour", name: "面粉", icon: "🌾" },
      { id: "oil", name: "食用油", icon: "🫒" },
      { id: "noodle", name: "面条", icon: "🍜" },
    ],
    filters: ["全部", "有机大米", "进口粮油", "新手礼包", "热销粮油"],
  },
  dry: {
    name: "干货",
    icon: "🌰",
    description: "天然干货，滋补佳品",
    bannerColor: "#795548",
    subcategories: [
      { id: "nuts", name: "坚果", icon: "🌰" },
      { id: "dried fruit", name: "干果", icon: "🍇" },
      { id: "dried seafood", name: "海鲜干货", icon: "🦐" },
      { id: "herbs", name: "滋补药材", icon: "🍵" },
    ],
    filters: ["全部", "坚果炒货", "天然干果", "滋补干货", "精选礼包"],
  },
};

const currentCategory = ref(null);
const products = ref([]);
const loading = ref(false);
const activeSubcategory = ref("all");
const activeFilter = ref("全部");
const sortBy = ref("default");
const currentPage = ref(1);
const pageSize = ref(20);
const totalProducts = ref(0);
const cartCount = ref(0);

const defaultProducts = {
  fruit: [
    { id: 1, name: "山东红富士苹果 5斤装 脆甜多汁", price: 12.99, originalPrice: 19.99, image: "https://img.freepik.com/free-photo/red-apple_1339-862.jpg", sold: 1256, discount: 35, tag: "热销爆款", subcategory: "apple" },
    { id: 2, name: "云南高原草莓 2斤装 新鲜直达", price: 29.99, originalPrice: 39.99, image: "https://img.freepik.com/free-photo/strawberry_1339-1032.jpg", sold: 896, discount: 25, tag: "限时优惠", subcategory: "berries" },
    { id: 3, name: "海南金煌芒果 3斤装 香甜可口", price: 24.99, originalPrice: 34.99, image: "https://img.freepik.com/free-photo/mango_1339-1014.jpg", sold: 756, tag: "精选推荐", subcategory: "tropical" },
    { id: 4, name: "智利进口车厘子 2斤装 精选大果", price: 68.99, originalPrice: 89.99, image: "https://img.freepik.com/free-photo/cherry_1339-1016.jpg", sold: 1523, discount: 23, tag: "热销爆款", subcategory: "apple" },
    { id: 5, name: "四川春见耙耙柑 5斤装 甜嫩多汁", price: 18.99, originalPrice: 25.99, image: "https://img.freepik.com/free-photo/citrus_1339-1007.jpg", sold: 634, tag: "新品上市", subcategory: "citrus" },
    { id: 6, name: "福建漳州蜜柚 2个装 皮薄肉厚", price: 22.99, originalPrice: 32.99, image: "https://img.freepik.com/free-photo/pomelo_1339-1008.jpg", sold: 445, tag: "精选推荐", subcategory: "citrus" },
  ],
  vegetable: [
    { id: 101, name: "有机生菜 500g 新鲜采摘", price: 6.99, originalPrice: 9.99, image: "https://img.freepik.com/free-photo/lettuce_1339-1034.jpg", sold: 2341, discount: 30, tag: "有机蔬菜", subcategory: "leafy" },
    { id: 102, name: "山东寿光西红柿 1kg 酸甜可口", price: 8.99, originalPrice: 12.99, image: "https://img.freepik.com/free-photo/tomato_1339-1015.jpg", sold: 1876, tag: "绿色蔬菜", subcategory: "leafy" },
    { id: 103, name: "新鲜黄瓜 750g 脆嫩爽口", price: 4.99, originalPrice: 7.99, image: "https://img.freepik.com/free-photo/cucumber_1339-1022.jpg", sold: 1567, tag: "热销推荐", subcategory: "root" },
    { id: 104, name: "云南高原青椒 500g 辣味浓郁", price: 7.99, originalPrice: 11.99, image: "https://img.freepik.com/free-photo/pepper_1339-1018.jpg", sold: 987, tag: "新品上架", subcategory: "leafy" },
    { id: 105, name: "东北黑木耳 200g 天然干货", price: 15.99, originalPrice: 22.99, image: "https://img.freepik.com/free-photo/mushroom_1339-1025.jpg", sold: 654, tag: "精选推荐", subcategory: "mushroom" },
    { id: 106, name: "新鲜菠菜 400g 营养健康", price: 5.99, originalPrice: 8.99, image: "https://img.freepik.com/free-photo/spinach_1339-1028.jpg", sold: 1234, discount: 33, tag: "有机蔬菜", subcategory: "leafy" },
  ],
  meat: [
    { id: 201, name: "农家散养土鸡蛋 30枚 营养丰富", price: 45.99, originalPrice: 59.99, image: "https://img.freepik.com/free-photo/eggs_1339-1023.jpg", sold: 2156, discount: 23, tag: "热销爆款", subcategory: "egg" },
    { id: 202, name: "土猪五花肉 500g 肉质鲜嫩", price: 35.99, originalPrice: 45.99, image: "https://img.freepik.com/free-photo/meat_1339-1020.jpg", sold: 1543, tag: "新鲜肉类", subcategory: "pork" },
    { id: 203, name: "进口牛排 200g 嫩滑多汁", price: 58.99, originalPrice: 78.99, image: "https://img.freepik.com/free-photo/steak_1339-1019.jpg", sold: 876, discount: 25, tag: "进口肉类", subcategory: "beef" },
    { id: 204, name: "新鲜鸡胸肉 500g 高蛋白低脂肪", price: 22.99, originalPrice: 29.99, image: "https://img.freepik.com/free-photo/chicken_1339-1021.jpg", sold: 1765, tag: "精选肉类", subcategory: "poultry" },
    { id: 205, name: "羊排 400g 鲜美可口", price: 48.99, originalPrice: 65.99, image: "https://img.freepik.com/free-photo/lamb_1339-1026.jpg", sold: 654, tag: "新品", subcategory: "lamb" },
    { id: 206, name: "鸭蛋 10枚 蛋黄饱满", price: 28.99, originalPrice: 38.99, image: "https://img.freepik.com/free-photo/duck-egg_1339-1027.jpg", sold: 987, tag: "有机蛋类", subcategory: "duck" },
  ],
  seafood: [
    { id: 301, name: "鲜活大闸蟹 4只 膏满黄肥", price: 128.99, originalPrice: 168.99, image: "https://img.freepik.com/free-photo/crab_1339-1030.jpg", sold: 765, discount: 24, tag: "鲜活水产", subcategory: "crab" },
    { id: 302, name: "南美对虾 500g 冰鲜直达", price: 48.99, originalPrice: 65.99, image: "https://img.freepik.com/free-photo/shrimp_1339-1031.jpg", sold: 2134, tag: "冰鲜水产", subcategory: "shrimp" },
    { id: 303, name: "东海带鱼 500g 新鲜海捕", price: 32.99, originalPrice: 45.99, image: "https://img.freepik.com/free-photo/fish_1339-1029.jpg", sold: 1456, tag: "鲜活水产", subcategory: "fish" },
    { id: 304, name: "扇贝 200g 鲜嫩肥美", price: 38.99, originalPrice: 52.99, image: "https://img.freepik.com/free-photo/scallop_1339-1033.jpg", sold: 876, tag: "精选海鲜", subcategory: "shellfish" },
    { id: 305, name: "进口龙虾 300g 高端海鲜", price: 188.99, originalPrice: 238.99, image: "https://img.freepik.com/free-photo/lobster_1339-1024.jpg", sold: 234, discount: 21, tag: "进口海鲜", subcategory: "shellfish" },
    { id: 306, name: "新鲜鱿鱼 400g 肉质Q弹", price: 25.99, originalPrice: 35.99, image: "https://img.freepik.com/free-photo/squid_1339-1035.jpg", sold: 654, tag: "鲜活水产", subcategory: "squid" },
  ],
  grain: [
    { id: 401, name: "五常大米 5kg 优质稻米", price: 42.99, originalPrice: 58.99, image: "https://img.freepik.com/free-photo/rice_1339-1005.jpg", sold: 3456, discount: 27, tag: "热销粮油", subcategory: "rice" },
    { id: 402, name: "花生油 5L 纯正压榨", price: 68.99, originalPrice: 88.99, image: "https://img.freepik.com/free-photo/oil_1339-1006.jpg", sold: 2134, tag: "精选粮油", subcategory: "oil" },
    { id: 403, name: "小麦面粉 5kg 高筋面粉", price: 28.99, originalPrice: 38.99, image: "https://img.freepik.com/free-photo/flour_1339-1009.jpg", sold: 1543, tag: "热销粮油", subcategory: "flour" },
    { id: 404, name: "东北玉米糁 2kg 粗粮细作", price: 18.99, originalPrice: 25.99, image: "https://img.freepik.com/free-photo/corn_1339-1010.jpg", sold: 876, tag: "有机大米", subcategory: "rice" },
    { id: 405, name: "紫米 1kg 补血养颜", price: 15.99, originalPrice: 22.99, image: "https://img.freepik.com/free-photo/black-rice_1339-1011.jpg", sold: 654, tag: "精选粮油", subcategory: "rice" },
    { id: 406, name: "绿豆 1kg 消暑解毒", price: 12.99, originalPrice: 18.99, image: "https://img.freepik.com/free-photo/bean_1339-1012.jpg", sold: 987, discount: 32, tag: "热销粮油", subcategory: "rice" },
  ],
  dry: [
    { id: 501, name: "新疆核桃 500g 补脑健脑", price: 32.99, originalPrice: 45.99, image: "https://img.freepik.com/free-photo/walnut_1339-1013.jpg", sold: 1876, discount: 28, tag: "坚果炒货", subcategory: "nuts" },
    { id: 502, name: "福建桂圆干 300g 滋补养颜", price: 28.99, originalPrice: 38.99, image: "https://img.freepik.com/free-photo/dried-longan_1339-1017.jpg", sold: 1234, tag: "天然干果", subcategory: "dried fruit" },
    { id: 503, name: "宁夏枸杞 250g 养生佳品", price: 38.99, originalPrice: 52.99, image: "https://img.freepik.com/free-photo/goji-berry_1339-1019.jpg", sold: 1567, discount: 26, tag: "滋补干货", subcategory: "herbs" },
    { id: 504, name: "开口松子 300g 香脆可口", price: 58.99, originalPrice: 78.99, image: "https://img.freepik.com/free-photo/pine-nut_1339-1020.jpg", sold: 765, tag: "坚果炒货", subcategory: "nuts" },
    { id: 505, name: "红枣 500g 补血养气", price: 22.99, originalPrice: 32.99, image: "https://img.freepik.com/free-photo/dried-red-date_1339-1021.jpg", sold: 2345, discount: 30, tag: "热销干货", subcategory: "dried fruit" },
    { id: 506, name: "香菇干 200g 香味浓郁", price: 25.99, originalPrice: 35.99, image: "https://img.freepik.com/free-photo/dried-mushroom_1339-1022.jpg", sold: 876, tag: "精选礼包", subcategory: "dried seafood" },
  ],
};

const handleOpenCart = () => {
  console.log("打开购物车");
};

const handleSearch = (query) => {
  console.log("搜索:", query);
};

const sortOptions = [
  { value: "default", label: "综合排序" },
  { value: "sales", label: "销量优先" },
  { value: "price_asc", label: "价格从低到高" },
  { value: "price_desc", label: "价格从高到低" },
  { value: "newest", label: "新品上架" },
];

const currentCategoryData = computed(() => {
  if (!currentCategory.value) return null;
  return categoryData[currentCategory.value] || null;
});

const filteredProducts = computed(() => {
  let result = [...products.value];

  if (activeSubcategory.value !== "all") {
    result = result.filter((p) => p.subcategory === activeSubcategory.value);
  }

  if (activeFilter.value !== "全部") {
    result = result.filter((p) => p.tag === activeFilter.value);
  }

  switch (sortBy.value) {
    case "sales":
      result.sort((a, b) => b.sold - a.sold);
      break;
    case "price_asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
  }

  return result;
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredProducts.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / pageSize.value);
});

const fetchProducts = async () => {
  loading.value = true;
  try {
    const categoryMap = {
      fruit: 1,
      vegetable: 2,
      meat: 3,
      seafood: 4,
      grain: 5,
      dry: 6,
    };
    const categoryId = categoryMap[currentCategory.value];
    if (categoryId) {
      try {
        const response = await productAPI.getProductsByCategory(categoryId);
        const productList = Array.isArray(response) ? response : [];
        if (productList.length > 0) {
          products.value = productList.map((p) => ({
            ...p,
            tag: p.discount ? "限时优惠" : p.sold > 500 ? "热销爆款" : "精选推荐",
            subcategory: "all",
          }));
        } else {
          products.value = [...(defaultProducts[currentCategory.value] || [])];
        }
      } catch (apiError) {
        console.log("使用默认产品数据");
        products.value = [...(defaultProducts[currentCategory.value] || [])];
      }
      totalProducts.value = products.value.length;
    }
  } catch (error) {
    console.error("获取产品失败:", error);
    products.value = [...(defaultProducts[currentCategory.value] || [])];
    totalProducts.value = products.value.length;
  } finally {
    loading.value = false;
  }
};

const handleSubcategoryClick = (subId) => {
  activeSubcategory.value = subId;
  currentPage.value = 1;
};

const handleFilterClick = (filter) => {
  activeFilter.value = filter;
  currentPage.value = 1;
};

const handleSortChange = (sort) => {
  sortBy.value = sort;
  currentPage.value = 1;
};

const handlePageChange = (page) => {
  currentPage.value = page;
  window.scrollTo({ top: 300, behavior: "smooth" });
};

const handleAddToCart = (product) => {
  console.log("添加到购物车:", product);
  alert(`已将 ${product.name} 添加到购物车`);
};

const handleViewDetail = (product) => {
  console.log("查看商品详情:", product);
};

watch(
  () => route.params.category,
  (newCategory) => {
    if (newCategory) {
      currentCategory.value = newCategory;
      activeSubcategory.value = "all";
      activeFilter.value = "全部";
      sortBy.value = "default";
      currentPage.value = 1;
      fetchProducts();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (route.params.category) {
    currentCategory.value = route.params.category;
    fetchProducts();
  }
});
</script>

<template>
  <div class="category-page">
    <Navbar
      :cart-count="cartCount"
      @open-cart="handleOpenCart"
      @search="handleSearch"
    />

    <main class="main" v-if="currentCategoryData">
      <div class="category-banner" :style="{ backgroundColor: currentCategoryData.bannerColor }">
        <div class="banner-overlay">
          <div class="banner-content">
            <span class="banner-icon">{{ currentCategoryData.icon }}</span>
            <h1 class="banner-title">{{ currentCategoryData.name }}</h1>
            <p class="banner-description">
              {{ currentCategoryData.description }}
            </p>
          </div>
        </div>
      </div>

      <div class="category-container">
        <div class="category-sidebar">
          <div class="sidebar-section">
            <h3 class="sidebar-title">全部分类</h3>
            <ul class="subcategory-list">
              <li
                class="subcategory-item"
                :class="{ active: activeSubcategory === 'all' }"
                @click="handleSubcategoryClick('all')"
              >
                <span class="subcategory-icon">📦</span>
                <span class="subcategory-name">全部商品</span>
                <span class="subcategory-count">({{ products.length }})</span>
              </li>
              <li
                v-for="sub in currentCategoryData.subcategories"
                :key="sub.id"
                class="subcategory-item"
                :class="{ active: activeSubcategory === sub.id }"
                @click="handleSubcategoryClick(sub.id)"
              >
                <span class="subcategory-icon">{{ sub.icon }}</span>
                <span class="subcategory-name">{{ sub.name }}</span>
              </li>
            </ul>
          </div>

          <div class="sidebar-section">
            <h3 class="sidebar-title">筛选条件</h3>
            <div class="filter-list">
              <button
                v-for="filter in currentCategoryData.filters"
                :key="filter"
                class="filter-btn"
                :class="{ active: activeFilter === filter }"
                @click="handleFilterClick(filter)"
              >
                {{ filter }}
              </button>
            </div>
          </div>

          <div class="sidebar-section">
            <h3 class="sidebar-title">精品推荐</h3>
            <div class="recommend-list">
              <div
                v-for="product in products.slice(0, 3)"
                :key="product.id"
                class="recommend-item"
              >
                <img :src="product.image" class="recommend-image" />
                <div class="recommend-info">
                  <p class="recommend-name">{{ product.name }}</p>
                  <p class="recommend-price">¥{{ product.price }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="category-content">
          <div class="content-header">
            <div class="header-left">
              <span class="result-count"
                >共找到 <strong>{{ filteredProducts.length }}</strong> 件商品</span
              >
            </div>
            <div class="header-right">
              <select
                v-model="sortBy"
                class="sort-select"
                @change="handleSortChange(sortBy)"
              >
                <option
                  v-for="option in sortOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="product-grid" v-if="!loading">
            <ProductCard
              v-for="product in paginatedProducts"
              :key="product.id"
              :product="product"
              @add-to-cart="handleAddToCart"
              @view-detail="handleViewDetail"
            />
          </div>

          <div class="loading" v-else>
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>

          <div class="pagination" v-if="totalPages > 1">
            <button
              class="page-btn"
              :disabled="currentPage === 1"
              @click="handlePageChange(currentPage - 1)"
            >
              上一页
            </button>
            <button
              v-for="page in totalPages"
              :key="page"
              class="page-btn"
              :class="{ active: currentPage === page }"
              @click="handlePageChange(page)"
            >
              {{ page }}
            </button>
            <button
              class="page-btn"
              :disabled="currentPage === totalPages"
              @click="handlePageChange(currentPage + 1)"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.category-page {
  min-height: 100vh;
  background-color: #f7f8f9;
}

.main {
  flex: 1;
  width: 100%;
  max-width: 100%;
}

.category-banner {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  margin-bottom: 2rem;
  background-color: #2eac70;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-content {
  text-align: center;
  color: white;
}

.banner-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
}

.banner-title {
  font-size: 3rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
}

.banner-description {
  font-size: 1.25rem;
  margin: 0;
  opacity: 0.9;
}

.category-container {
  display: flex;
  gap: 2rem;
  padding: 0 2rem;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
}

.category-sidebar {
  flex: 0 0 280px;
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 100px;
}

.sidebar-section {
  margin-bottom: 2rem;
}

.sidebar-section:last-child {
  margin-bottom: 0;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: bold;
  color: #333;
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #2eac70;
}

.subcategory-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.subcategory-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
  margin-bottom: 0.5rem;
}

.subcategory-item:hover {
  background-color: rgba(46, 172, 112, 0.1);
}

.subcategory-item.active {
  background-color: #2eac70;
  color: white;
}

.subcategory-icon {
  font-size: 1.25rem;
}

.subcategory-name {
  flex: 1;
  font-size: 0.9375rem;
}

.subcategory-count {
  font-size: 0.75rem;
  color: #999;
}

.subcategory-item.active .subcategory-count {
  color: rgba(255, 255, 255, 0.8);
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.75rem 1rem;
  background-color: #f7f8f9;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.875rem;
  text-align: left;
}

.filter-btn:hover {
  border-color: #2eac70;
  color: #2eac70;
}

.filter-btn.active {
  background-color: #2eac70;
  border-color: #2eac70;
  color: white;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommend-item {
  display: flex;
  gap: 0.75rem;
  cursor: pointer;
  transition: transform 0.3s;
}

.recommend-item:hover {
  transform: translateX(5px);
}

.recommend-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.recommend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.recommend-name {
  font-size: 0.875rem;
  color: #333;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommend-price {
  font-size: 1rem;
  font-weight: bold;
  color: #2eac70;
  margin: 0;
}

.category-content {
  flex: 1;
  min-width: 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.result-count {
  font-size: 0.9375rem;
  color: #666;
}

.result-count strong {
  color: #2eac70;
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  outline: none;
}

.sort-select:focus {
  border-color: #2eac70;
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.product-grid > * {
  flex: 0 0 calc(33.333% - 1rem);
  max-width: calc(33.333% - 1rem);
  box-sizing: border-box;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background-color: white;
  border-radius: 12px;
  width: 100%;
  box-sizing: border-box;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex-wrap: wrap;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.875rem;
}

.page-btn:hover:not(:disabled) {
  border-color: #2eac70;
  color: #2eac70;
}

.page-btn.active {
  background-color: #2eac70;
  border-color: #2eac70;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .category-container {
    flex-direction: column;
    padding: 0 1rem;
  }

  .category-sidebar {
    flex: none;
    width: 100%;
    position: static;
  }

  .category-banner {
    height: 200px;
  }

  .banner-title {
    font-size: 2rem;
  }

  .banner-description {
    font-size: 1rem;
  }

  .product-grid {
    gap: 1rem;
  }

  .product-grid > * {
    flex: 0 0 calc(33.333% - 0.75rem);
    max-width: calc(33.333% - 0.75rem);
  }
}

@media (max-width: 500px) {
  .category-banner {
    height: 180px;
  }

  .banner-icon {
    font-size: 3rem;
  }

  .banner-title {
    font-size: 1.75rem;
  }

  .banner-description {
    font-size: 0.875rem;
  }

  .content-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .product-grid {
    gap: 0.75rem;
  }

  .product-grid > * {
    flex: 0 0 calc(50% - 0.375rem);
    max-width: calc(50% - 0.375rem);
  }

  .pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .category-banner {
    height: 150px;
  }

  .banner-icon {
    font-size: 2.5rem;
  }

  .banner-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .banner-description {
    font-size: 0.75rem;
  }

  .product-grid {
    gap: 0.5rem;
  }

  .product-grid > * {
    flex: 0 0 calc(50% - 0.25rem);
    max-width: calc(50% - 0.25rem);
  }

  .page-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
}
</style>
