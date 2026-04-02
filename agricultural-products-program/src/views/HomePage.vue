<script setup>
import Navbar from "../components/Navbar.vue";
import Carousel from "../components/Carousel.vue";
import ProductList from "../components/ProductList.vue";
import ProductDetail from "../components/ProductDetail.vue";
import Cart from "../components/Cart.vue";
import Footer from "../components/Footer.vue";
import { ref, computed, onMounted } from "vue";
import { productAPI, cartAPI } from "../services/api";

// 定义变量
const cartItems = ref([]);
const showProductDetail = ref(false);
const selectedProduct = ref(null);
const showCart = ref(false);
const searchQuery = ref("");
const showSearchResults = ref(false);
const freshFruits = ref([]);
const freshVegetables = ref([]);
const meatProducts = ref([]);
const seafoodProducts = ref([]);
const grainProducts = ref([]);
const dryProducts = ref([]);
const loading = ref(false);
const searchResultsData = ref([]);

// 计算属性
const cartCount = computed(() => {
  return cartItems.value.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );
});

const allProducts = computed(() => {
  return [...freshFruits.value, ...freshVegetables.value];
});

const searchResults = computed(() => {
  return searchResultsData.value;
});

// 处理函数
const handleViewDetail = (product) => {
  selectedProduct.value = product;
  showProductDetail.value = true;
};

const handleCloseDetail = () => {
  showProductDetail.value = false;
  selectedProduct.value = null;
};

const handleAddToCart = async (product) => {
  try {
    // 检查用户是否登录
    const token = localStorage.getItem("token");
    if (!token) {
      alert("请先登录");
      return;
    }

    // 调用API添加商品到购物车
    await cartAPI.addToCart({
      product_id: product.id,
      quantity: product.quantity,
    });
    // 重新获取购物车数据
    await fetchCart();
    console.log("添加到购物车:", product);
  } catch (error) {
    console.error("添加到购物车失败:", error);
    alert("添加到购物车失败，请先登录");
  }
};

const handleLocalAddToCart = (product) => {
  // 从本地存储获取购物车数据
  let localCart = JSON.parse(localStorage.getItem("cart")) || [];

  // 检查商品是否已在购物车中
  const existingItemIndex = localCart.findIndex(
    (item) => item.id === product.id,
  );

  if (existingItemIndex !== -1) {
    // 如果商品已存在，更新数量
    localCart[existingItemIndex].quantity =
      (Number(localCart[existingItemIndex].quantity) || 0) +
      (Number(product.quantity) || 0);
  } else {
    // 如果商品不存在，添加到购物车
    localCart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: Number(product.quantity) || 1,
    });
  }

  // 保存到本地存储
  localStorage.setItem("cart", JSON.stringify(localCart));
  // 更新购物车数据
  updateCartFromLocal();
  console.log("添加到本地购物车:", product);
};

const updateCartFromLocal = () => {
  // 从本地存储获取购物车数据
  const localCart = JSON.parse(localStorage.getItem("cart")) || [];
  cartItems.value = localCart;
};

const handleOpenCart = () => {
  // 检查用户是否登录
  const token = localStorage.getItem("token");
  if (!token) {
    alert("请先登录");
    return;
  }
  showCart.value = true;
};

const handleCloseCart = () => {
  showCart.value = false;
};

const handleUpdateCart = async (updatedItems) => {
  try {
    // 尝试调用API更新购物车
    const token = localStorage.getItem("token");
    if (token) {
      // 只在用户登录时调用API
      // 检查是否是清空购物车的操作（结算后）
      if (updatedItems.length === 0) {
        // 直接清空前端购物车数据
        cartItems.value = [];
      } else {
        // 其他情况，重新获取购物车数据
        await fetchCart();
      }
    } else {
      // 用户未登录，直接更新本地存储
      handleLocalUpdateCart(updatedItems);
    }
  } catch (error) {
    console.error("更新购物车失败:", error);
    // 如果API调用失败，更新本地存储中的购物车数据
    handleLocalUpdateCart(updatedItems);
  }
};

const handleLocalUpdateCart = (updatedItems) => {
  // 过滤出数量大于0的商品
  const validItems = updatedItems.filter((item) => item.quantity > 0);
  // 保存到本地存储
  localStorage.setItem("cart", JSON.stringify(validItems));
  // 更新购物车数据
  updateCartFromLocal();
  console.log("更新本地购物车:", validItems);
};

const handleSearch = async (query) => {
  searchQuery.value = query;
  showSearchResults.value = true;
  try {
    console.log("搜索关键词:", query);
    // 调用API搜索产品
    const results = await productAPI.searchProducts(query);
    console.log("搜索结果:", results);
    searchResultsData.value = results.data || [];
  } catch (error) {
    console.error("搜索失败:", error);
    console.error("错误详情:", error.response);
    searchResultsData.value = [];
  }
};

// 获取产品数据
const fetchProducts = async () => {
  try {
    loading.value = true;
    // 假设1是水果分类ID，2是蔬菜分类ID，3是肉禽蛋分类ID，4是水产分类ID，5是粮油分类ID，6是干货分类ID
    const fruits = await productAPI.getProductsByCategory(1);
    const vegetables = await productAPI.getProductsByCategory(2);
    const meat = await productAPI.getProductsByCategory(3);
    const seafood = await productAPI.getProductsByCategory(4);
    const grain = await productAPI.getProductsByCategory(5);
    const dry = await productAPI.getProductsByCategory(6);
    console.log("水果数据:", fruits);
    console.log("蔬菜数据:", vegetables);
    console.log("肉禽蛋数据:", meat);
    console.log("水产数据:", seafood);
    console.log("粮油数据:", grain);
    console.log("干货数据:", dry);
    freshFruits.value = fruits.data || [];
    freshVegetables.value = vegetables.data || [];
    meatProducts.value = meat.data || [];
    seafoodProducts.value = seafood.data || [];
    grainProducts.value = grain.data || [];
    dryProducts.value = dry.data || [];
  } catch (error) {
    console.error("获取产品数据失败:", error);
    // 如果API调用失败，使用默认数据
    freshFruits.value = [
      {
        id: 1,
        name: "新鲜苹果",
        description: "山东红富士苹果，脆甜多汁，富含维生素C",
        price: 12.99,
        originalPrice: 15.99,
        discount: 20,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20red%20apples%20farm%20fresh&image_size=square",
      },
      {
        id: 2,
        name: "精选草莓",
        description: "云南高原草莓，香甜可口，新鲜直达",
        price: 29.99,
        originalPrice: 39.99,
        discount: 25,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20strawberries%20farm%20fresh&image_size=square",
      },
      {
        id: 3,
        name: "进口橙子",
        description: "南非进口橙子，果肉饱满，汁多味甜",
        price: 19.99,
        originalPrice: 24.99,
        discount: 20,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20oranges%20farm%20fresh&image_size=square",
      },
      {
        id: 4,
        name: "新疆香梨",
        description: "新疆库尔勒香梨，肉质细腻，清脆爽口",
        price: 15.99,
        originalPrice: 19.99,
        discount: 20,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20pears%20farm%20fresh&image_size=square",
      },
    ];
    freshVegetables.value = [
      {
        id: 5,
        name: "有机生菜",
        description: "有机种植生菜，新鲜脆嫩，富含营养",
        price: 8.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20lettuce%20organic%20vegetable&image_size=square",
      },
      {
        id: 6,
        name: "西红柿",
        description: "山东寿光西红柿，酸甜可口，自然成熟",
        price: 6.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20tomatoes%20farm%20fresh&image_size=square",
      },
      {
        id: 7,
        name: "黄瓜",
        description: "新鲜黄瓜，清脆爽口，适合凉拌",
        price: 4.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20cucumbers%20farm%20fresh&image_size=square",
      },
      {
        id: 8,
        name: "西兰花",
        description: "新鲜西兰花，营养丰富，口感鲜美",
        price: 9.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20broccoli%20farm%20fresh&image_size=square",
      },
    ];
    meatProducts.value = [
      {
        id: 9,
        name: "土鸡蛋",
        description: "农家散养土鸡蛋，营养丰富，口感鲜美",
        price: 29.99,
        originalPrice: 35.99,
        discount: 17,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20organic%20eggs%20farm%20fresh&image_size=square",
      },
      {
        id: 10,
        name: "新鲜猪肉",
        description: "土猪五花肉，肥瘦相间，肉质鲜美",
        price: 39.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20pork%20meat%20farm%20fresh&image_size=square",
      },
      {
        id: 11,
        name: "鸡肉",
        description: "散养土鸡，肉质紧实，味道鲜美",
        price: 25.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20chicken%20meat%20farm%20fresh&image_size=square",
      },
      {
        id: 12,
        name: "牛肉",
        description: "新鲜牛肉，肉质鲜嫩，营养丰富",
        price: 69.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20beef%20meat%20farm%20fresh&image_size=square",
      },
    ];
    seafoodProducts.value = [
      {
        id: 13,
        name: "新鲜虾",
        description: "活虾现捕，肉质鲜美，营养丰富",
        price: 49.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20shrimp%20seafood&image_size=square",
      },
      {
        id: 14,
        name: "鱼",
        description: "新鲜活鱼，肉质鲜嫩，味道鲜美",
        price: 29.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20fish%20seafood&image_size=square",
      },
      {
        id: 15,
        name: "螃蟹",
        description: "新鲜螃蟹，肉质鲜美，营养丰富",
        price: 89.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20crab%20seafood&image_size=square",
      },
      {
        id: 16,
        name: "贝类",
        description: "新鲜贝类，肉质鲜嫩，味道鲜美",
        price: 39.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20shellfish%20seafood&image_size=square",
      },
    ];
    grainProducts.value = [
      {
        id: 17,
        name: "大米",
        description: "东北大米，颗粒饱满，口感香糯",
        price: 59.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20rice%20grain&image_size=square",
      },
      {
        id: 18,
        name: "面粉",
        description: "优质面粉，粉质细腻，适合各种面食",
        price: 39.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20flour%20grain&image_size=square",
      },
      {
        id: 19,
        name: "食用油",
        description: "压榨花生油，香味浓郁，营养健康",
        price: 89.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20cooking%20oil&image_size=square",
      },
      {
        id: 20,
        name: "面条",
        description: "手工面条，口感筋道，营养健康",
        price: 19.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20noodles&image_size=square",
      },
    ];
    dryProducts.value = [
      {
        id: 21,
        name: "香菇",
        description: "干香菇，香味浓郁，营养丰富",
        price: 49.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20shiitake%20mushrooms&image_size=square",
      },
      {
        id: 22,
        name: "木耳",
        description: "黑木耳，肉质肥厚，营养丰富",
        price: 39.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20black%20fungus&image_size=square",
      },
      {
        id: 23,
        name: "红枣",
        description: "新疆红枣，果肉饱满，甜度高",
        price: 29.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20red%20dates&image_size=square",
      },
      {
        id: 24,
        name: "枸杞",
        description: "宁夏枸杞，颗粒饱满，营养丰富",
        price: 59.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20wolfberries&image_size=square",
      },
    ];
  } finally {
    loading.value = false;
  }
};

// 获取购物车数据
const fetchCart = async () => {
  try {
    // 检查用户是否登录
    const token = localStorage.getItem("token");
    if (!token) {
      // 未登录用户，显示空购物车
      cartItems.value = [];
      return;
    }

    const cartData = await cartAPI.getCart();
    // 转换购物车数据格式，处理后端返回的包含Product对象的数据
    cartItems.value = (cartData.data?.items || []).map((item) => {
      if (item.Product) {
        // 后端返回的数据格式，包含Product对象
        return {
          id: item.product_id,
          name: item.Product.name,
          price: item.Product.price,
          image: item.Product.image,
          quantity: item.quantity,
        };
      }
      // 前端本地存储的数据格式
      return item;
    });
  } catch (error) {
    console.error("获取购物车数据失败:", error);
    // 当API调用失败时，显示空购物车
    cartItems.value = [];
  }
};

// 组件挂载时随动
onMounted(async () => {
  await fetchProducts();
  await fetchCart();
});
</script>

<template>
  <div class="home">
    <Navbar
      :cart-count="cartCount"
      @open-cart="handleOpenCart"
      @search="handleSearch"
    />
    <main class="main">
      <section class="hero" v-if="!showSearchResults">
        <Carousel />
      </section>

      <ProductList
        v-if="!showSearchResults"
        id="fresh-fruits"
        title="新鲜水果"
        :products="freshFruits"
        @add-to-cart="handleAddToCart"
        @view-detail="handleViewDetail"
      />

      <ProductList
        v-if="!showSearchResults"
        id="fresh-vegetables"
        title="新鲜蔬菜"
        :products="freshVegetables"
        @add-to-cart="handleAddToCart"
        @view-detail="handleViewDetail"
      />

      <ProductList
        v-if="!showSearchResults"
        id="meat-products"
        title="肉禽蛋"
        :products="meatProducts"
        @add-to-cart="handleAddToCart"
        @view-detail="handleViewDetail"
      />

      <ProductList
        v-if="!showSearchResults"
        id="seafood-products"
        title="水产"
        :products="seafoodProducts"
        @add-to-cart="handleAddToCart"
        @view-detail="handleViewDetail"
      />

      <ProductList
        v-if="!showSearchResults"
        id="grain-products"
        title="粮油"
        :products="grainProducts"
        @add-to-cart="handleAddToCart"
        @view-detail="handleViewDetail"
      />

      <ProductList
        v-if="!showSearchResults"
        id="dry-products"
        title="干货"
        :products="dryProducts"
        @add-to-cart="handleAddToCart"
        @view-detail="handleViewDetail"
      />

      <ProductList
        v-if="showSearchResults"
        title="搜索结果"
        :products="searchResults"
        @add-to-cart="handleAddToCart"
        @view-detail="handleViewDetail"
      />

      <ProductDetail
        v-if="showProductDetail && selectedProduct"
        :product="selectedProduct"
        @add-to-cart="handleAddToCart"
        @close="handleCloseDetail"
      />

      <Cart
        v-if="showCart"
        :items="cartItems"
        @update:items="handleUpdateCart"
        @close="handleCloseCart"
      />
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  width: 100%;
  max-width: 100%;
}

.hero {
  margin: 1rem 0;
  width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;
}

@media (max-width: 1200px) {
  .hero {
    margin: 0.75rem 0;
  }
}

@media (max-width: 768px) {
  .hero {
    margin: 0.5rem 0;
    padding: 0 0.75rem;
  }
}

@media (max-width: 480px) {
  .hero {
    margin: 0.25rem 0;
    padding: 0 0.5rem;
  }
}
</style>
