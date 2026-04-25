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
const todayHot = ref([]);
const seckillProducts = ref([]);
const combos = ref([]);
const springLimited = ref([]);

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
    // 静默处理错误，不显示错误日志
    // console.error("添加到购物车失败:", error);
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
    // 静默处理错误，不显示错误日志
    // console.error("更新购物车失败:", error);
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

const handleBuyCombo = (combo) => {
  // 将套餐中的所有商品添加到购物车
  combo.items.forEach((item) => {
    handleLocalAddToCart({ ...item, quantity: 1 });
  });
  alert(`已将${combo.name}中的商品添加到购物车`);
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
    // 静默处理错误，不显示错误日志
    // console.error("搜索失败:", error);
    // console.error("错误详情:", error.response);
    searchResultsData.value = [];
  }
};

// 获取产品数据
const fetchProducts = async () => {
  try {
    loading.value = true;
    // 直接使用默认数据，避免 API 调用产生网络错误
    // 水果数据
    freshFruits.value = [
      {
        id: 1,
        name: "山东红富士苹果 5斤装 脆甜多汁",
        description: "山东烟台红富士苹果，脆甜多汁，富含维生素C，精选大果",
        price: 12.99,
        originalPrice: 15.99,
        discount: 20,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20red%20apples%20farm%20fresh&image_size=square",
      },
      {
        id: 2,
        name: "云南高原草莓 2斤装 香甜可口",
        description: "云南高原草莓，香甜可口，新鲜直达，自然成熟",
        price: 29.99,
        originalPrice: 39.99,
        discount: 25,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20strawberries%20farm%20fresh&image_size=square",
      },
      {
        id: 3,
        name: "南非进口橙子 4斤装 汁多味甜",
        description: "南非进口橙子，果肉饱满，汁多味甜，富含维生素C",
        price: 19.99,
        originalPrice: 24.99,
        discount: 20,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20oranges%20farm%20fresh&image_size=square",
      },
      {
        id: 4,
        name: "新疆库尔勒香梨 3斤装 清脆爽口",
        description: "新疆库尔勒香梨，肉质细腻，清脆爽口，汁多味甜",
        price: 15.99,
        originalPrice: 19.99,
        discount: 20,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20pears%20farm%20fresh&image_size=square",
      },
    ];
    // 蔬菜数据
    freshVegetables.value = [
      {
        id: 5,
        name: "有机生菜 500g 新鲜脆嫩",
        description: "有机种植生菜，新鲜脆嫩，富含营养，无农药残留",
        price: 8.99,
        originalPrice: 10.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20lettuce%20organic%20vegetable&image_size=square",
      },
      {
        id: 6,
        name: "山东寿光西红柿 2斤装 酸甜可口",
        description: "山东寿光西红柿，酸甜可口，自然成熟，沙瓤多汁",
        price: 6.99,
        originalPrice: 8.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20tomatoes%20farm%20fresh&image_size=square",
      },
      {
        id: 7,
        name: "新鲜黄瓜 2斤装 清脆爽口",
        description: "新鲜黄瓜，清脆爽口，适合凉拌，自然生长",
        price: 4.99,
        originalPrice: 6.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20cucumbers%20farm%20fresh&image_size=square",
      },
      {
        id: 8,
        name: "西兰花 500g 营养丰富",
        description: "新鲜西兰花，营养丰富，口感鲜美，适合多种烹饪方式",
        price: 9.99,
        originalPrice: 12.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20broccoli%20farm%20fresh&image_size=square",
      },
    ];
    // 肉禽蛋数据
    meatProducts.value = [
      {
        id: 9,
        name: "农家散养土鸡蛋 30枚装 营养丰富",
        description: "农家散养土鸡蛋，营养丰富，口感鲜美，无抗生素",
        price: 29.99,
        originalPrice: 35.99,
        discount: 17,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20organic%20eggs%20farm%20fresh&image_size=square",
      },
      {
        id: 10,
        name: "土猪五花肉 500g 肥瘦相间",
        description: "土猪五花肉，肥瘦相间，肉质鲜美，适合红烧肉",
        price: 39.99,
        originalPrice: 49.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20pork%20meat%20farm%20fresh&image_size=square",
      },
      {
        id: 11,
        name: "散养土鸡 整只 2斤 肉质紧实",
        description: "散养土鸡，肉质紧实，味道鲜美，营养丰富",
        price: 25.99,
        originalPrice: 32.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20chicken%20meat%20farm%20fresh&image_size=square",
      },
      {
        id: 12,
        name: "新鲜牛肉 500g 肉质鲜嫩",
        description: "新鲜牛肉，肉质鲜嫩，营养丰富，适合多种烹饪方式",
        price: 69.99,
        originalPrice: 89.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20beef%20meat%20farm%20fresh&image_size=square",
      },
    ];
    // 水产数据
    seafoodProducts.value = [
      {
        id: 13,
        name: "新鲜活虾 500g 肉质鲜美",
        description: "活虾现捕，肉质鲜美，营养丰富，新鲜直达",
        price: 49.99,
        originalPrice: 59.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20shrimp%20seafood&image_size=square",
      },
      {
        id: 14,
        name: "新鲜活鱼 1条 约1.5斤 肉质鲜嫩",
        description: "新鲜活鱼，肉质鲜嫩，味道鲜美，营养丰富",
        price: 29.99,
        originalPrice: 39.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20fish%20seafood&image_size=square",
      },
      {
        id: 15,
        name: "新鲜螃蟹 2只 约4两/只 肉质鲜美",
        description: "新鲜螃蟹，肉质鲜美，营养丰富，膏满黄肥",
        price: 89.99,
        originalPrice: 119.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20crab%20seafood&image_size=square",
      },
      {
        id: 16,
        name: "新鲜贝类 500g 肉质鲜嫩",
        description: "新鲜贝类，肉质鲜嫩，味道鲜美，营养丰富",
        price: 39.99,
        originalPrice: 49.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20shellfish%20seafood&image_size=square",
      },
    ];
    // 粮油数据
    grainProducts.value = [
      {
        id: 17,
        name: "东北大米 5kg 颗粒饱满",
        description: "东北大米，颗粒饱满，口感香糯，无污染",
        price: 59.99,
        originalPrice: 69.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20rice%20grain&image_size=square",
      },
      {
        id: 18,
        name: "优质面粉 2.5kg 粉质细腻",
        description: "优质面粉，粉质细腻，适合各种面食，无添加剂",
        price: 39.99,
        originalPrice: 49.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20flour%20grain&image_size=square",
      },
      {
        id: 19,
        name: "压榨花生油 5L 香味浓郁",
        description: "压榨花生油，香味浓郁，营养健康，无添加",
        price: 89.99,
        originalPrice: 109.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20cooking%20oil&image_size=square",
      },
      {
        id: 20,
        name: "手工面条 1kg 口感筋道",
        description: "手工面条，口感筋道，营养健康，易煮不易断",
        price: 19.99,
        originalPrice: 24.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20noodles&image_size=square",
      },
    ];
    // 干货数据
    dryProducts.value = [
      {
        id: 21,
        name: "干香菇 250g 香味浓郁",
        description: "干香菇，香味浓郁，营养丰富，肉厚柄短",
        price: 49.99,
        originalPrice: 59.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20shiitake%20mushrooms&image_size=square",
      },
      {
        id: 22,
        name: "黑木耳 250g 肉质肥厚",
        description: "黑木耳，肉质肥厚，营养丰富，无根无杂质",
        price: 39.99,
        originalPrice: 49.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20black%20fungus&image_size=square",
      },
      {
        id: 23,
        name: "新疆红枣 500g 果肉饱满",
        description: "新疆红枣，果肉饱满，甜度高，营养丰富",
        price: 29.99,
        originalPrice: 39.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20red%20dates&image_size=square",
      },
      {
        id: 24,
        name: "宁夏枸杞 250g 颗粒饱满",
        description: "宁夏枸杞，颗粒饱满，营养丰富，自然晾晒",
        price: 59.99,
        originalPrice: 79.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20wolfberries&image_size=square",
      },
    ];
  } catch (error) {
    // 静默处理错误，不显示错误日志
    // console.error("获取产品数据失败:", error);
  } finally {
    loading.value = false;

    // 确保商品数据存在，如果API返回空数据，使用默认数据
    if (freshFruits.value.length === 0) {
      freshFruits.value = [
        {
          id: 1,
          name: "山东红富士苹果 5斤装 脆甜多汁",
          description: "山东烟台红富士苹果，脆甜多汁，富含维生素C，精选大果",
          price: 12.99,
          originalPrice: 15.99,
          discount: 20,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20red%20apples%20farm%20fresh&image_size=square",
        },
        {
          id: 2,
          name: "云南高原草莓 2斤装 香甜可口",
          description: "云南高原草莓，香甜可口，新鲜直达，自然成熟",
          price: 29.99,
          originalPrice: 39.99,
          discount: 25,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20strawberries%20farm%20fresh&image_size=square",
        },
        {
          id: 3,
          name: "南非进口橙子 4斤装 汁多味甜",
          description: "南非进口橙子，果肉饱满，汁多味甜，富含维生素C",
          price: 19.99,
          originalPrice: 24.99,
          discount: 20,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20oranges%20farm%20fresh&image_size=square",
        },
        {
          id: 4,
          name: "新疆库尔勒香梨 3斤装 清脆爽口",
          description: "新疆库尔勒香梨，肉质细腻，清脆爽口，汁多味甜",
          price: 15.99,
          originalPrice: 19.99,
          discount: 20,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20pears%20farm%20fresh&image_size=square",
        },
      ];
    }

    if (freshVegetables.value.length === 0) {
      freshVegetables.value = [
        {
          id: 5,
          name: "有机生菜 500g 新鲜脆嫩",
          description: "有机种植生菜，新鲜脆嫩，富含营养，无农药残留",
          price: 8.99,
          originalPrice: 10.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20lettuce%20organic%20vegetable&image_size=square",
        },
        {
          id: 6,
          name: "山东寿光西红柿 2斤装 酸甜可口",
          description: "山东寿光西红柿，酸甜可口，自然成熟，沙瓤多汁",
          price: 6.99,
          originalPrice: 8.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20tomatoes%20farm%20fresh&image_size=square",
        },
        {
          id: 7,
          name: "新鲜黄瓜 2斤装 清脆爽口",
          description: "新鲜黄瓜，清脆爽口，适合凉拌，自然生长",
          price: 4.99,
          originalPrice: 6.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20cucumbers%20farm%20fresh&image_size=square",
        },
        {
          id: 8,
          name: "西兰花 500g 营养丰富",
          description: "新鲜西兰花，营养丰富，口感鲜美，适合多种烹饪方式",
          price: 9.99,
          originalPrice: 12.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20broccoli%20farm%20fresh&image_size=square",
        },
      ];
    }

    if (meatProducts.value.length === 0) {
      meatProducts.value = [
        {
          id: 9,
          name: "农家散养土鸡蛋 30枚装 营养丰富",
          description: "农家散养土鸡蛋，营养丰富，口感鲜美，无抗生素",
          price: 29.99,
          originalPrice: 35.99,
          discount: 17,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20organic%20eggs%20farm%20fresh&image_size=square",
        },
        {
          id: 10,
          name: "土猪五花肉 500g 肥瘦相间",
          description: "土猪五花肉，肥瘦相间，肉质鲜美，适合红烧肉",
          price: 39.99,
          originalPrice: 49.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20pork%20meat%20farm%20fresh&image_size=square",
        },
        {
          id: 11,
          name: "散养土鸡 整只 2斤 肉质紧实",
          description: "散养土鸡，肉质紧实，味道鲜美，营养丰富",
          price: 25.99,
          originalPrice: 32.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20chicken%20meat%20farm%20fresh&image_size=square",
        },
        {
          id: 12,
          name: "新鲜牛肉 500g 肉质鲜嫩",
          description: "新鲜牛肉，肉质鲜嫩，营养丰富，适合多种烹饪方式",
          price: 69.99,
          originalPrice: 89.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20beef%20meat%20farm%20fresh&image_size=square",
        },
      ];
    }

    if (seafoodProducts.value.length === 0) {
      seafoodProducts.value = [
        {
          id: 13,
          name: "新鲜活虾 500g 肉质鲜美",
          description: "活虾现捕，肉质鲜美，营养丰富，新鲜直达",
          price: 49.99,
          originalPrice: 59.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20shrimp%20seafood&image_size=square",
        },
        {
          id: 14,
          name: "新鲜活鱼 1条 约1.5斤 肉质鲜嫩",
          description: "新鲜活鱼，肉质鲜嫩，味道鲜美，营养丰富",
          price: 29.99,
          originalPrice: 39.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20fish%20seafood&image_size=square",
        },
        {
          id: 15,
          name: "新鲜螃蟹 2只 约4两/只 肉质鲜美",
          description: "新鲜螃蟹，肉质鲜美，营养丰富，膏满黄肥",
          price: 89.99,
          originalPrice: 119.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20crab%20seafood&image_size=square",
        },
        {
          id: 16,
          name: "新鲜贝类 500g 肉质鲜嫩",
          description: "新鲜贝类，肉质鲜嫩，味道鲜美，营养丰富",
          price: 39.99,
          originalPrice: 49.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20shellfish%20seafood&image_size=square",
        },
      ];
    }

    if (grainProducts.value.length === 0) {
      grainProducts.value = [
        {
          id: 17,
          name: "东北大米 5kg 颗粒饱满",
          description: "东北大米，颗粒饱满，口感香糯，无污染",
          price: 59.99,
          originalPrice: 69.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20rice%20grain&image_size=square",
        },
        {
          id: 18,
          name: "优质面粉 2.5kg 粉质细腻",
          description: "优质面粉，粉质细腻，适合各种面食，无添加剂",
          price: 39.99,
          originalPrice: 49.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20flour%20grain&image_size=square",
        },
        {
          id: 19,
          name: "压榨花生油 5L 香味浓郁",
          description: "压榨花生油，香味浓郁，营养健康，无添加",
          price: 89.99,
          originalPrice: 109.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20cooking%20oil&image_size=square",
        },
        {
          id: 20,
          name: "手工面条 1kg 口感筋道",
          description: "手工面条，口感筋道，营养健康，易煮不易断",
          price: 19.99,
          originalPrice: 24.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20noodles&image_size=square",
        },
      ];
    }

    if (dryProducts.value.length === 0) {
      dryProducts.value = [
        {
          id: 21,
          name: "干香菇 250g 香味浓郁",
          description: "干香菇，香味浓郁，营养丰富，肉厚柄短",
          price: 49.99,
          originalPrice: 59.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20shiitake%20mushrooms&image_size=square",
        },
        {
          id: 22,
          name: "黑木耳 250g 肉质肥厚",
          description: "黑木耳，肉质肥厚，营养丰富，无根无杂质",
          price: 39.99,
          originalPrice: 49.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20black%20fungus&image_size=square",
        },
        {
          id: 23,
          name: "新疆红枣 500g 果肉饱满",
          description: "新疆红枣，果肉饱满，甜度高，营养丰富",
          price: 29.99,
          originalPrice: 39.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20red%20dates&image_size=square",
        },
        {
          id: 24,
          name: "宁夏枸杞 250g 颗粒饱满",
          description: "宁夏枸杞，颗粒饱满，营养丰富，自然晾晒",
          price: 59.99,
          originalPrice: 79.99,
          image:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20wolfberries&image_size=square",
        },
      ];
    }

    // 初始化今日爆款数据
    todayHot.value = [
      freshFruits.value[0], // 山东红富士苹果
      meatProducts.value[0], // 农家散养土鸡蛋
      freshVegetables.value[0], // 有机生菜
    ];

    // 初始化限时秒杀数据
    seckillProducts.value = [
      {
        ...freshFruits.value[1], // 云南高原草莓
        price: 19.99, // 秒杀价
        originalPrice: 29.99,
      },
      {
        ...meatProducts.value[1], // 土猪五花肉
        price: 29.99, // 秒杀价
        originalPrice: 49.99,
      },
      {
        ...freshVegetables.value[1], // 山东寿光西红柿
        price: 4.99, // 秒杀价
        originalPrice: 8.99,
      },
    ];

    // 初始化搭配套餐数据
    combos.value = [
      {
        id: 1,
        name: "水果组合套餐",
        items: [
          freshFruits.value[0], // 山东红富士苹果
          freshFruits.value[1], // 云南高原草莓
        ],
        currentPrice: 39.99,
        originalPrice: 42.98,
        save: 2.99,
      },
      {
        id: 2,
        name: "蔬菜组合套餐",
        items: [
          freshVegetables.value[0], // 有机生菜
          freshVegetables.value[1], // 山东寿光西红柿
          freshVegetables.value[2], // 新鲜黄瓜
        ],
        currentPrice: 16.99,
        originalPrice: 20.97,
        save: 3.98,
      },
      {
        id: 3,
        name: "肉禽蛋组合套餐",
        items: [
          meatProducts.value[0], // 农家散养土鸡蛋
          meatProducts.value[1], // 土猪五花肉
        ],
        currentPrice: 64.99,
        originalPrice: 79.98,
        save: 14.99,
      },
    ];

    // 初始化春季限定数据
    springLimited.value = [
      {
        id: 101,
        name: "云南高原草莓 2斤装",
        price: 29.99,
        originalPrice: 39.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20strawberries%20spring%20season&image_size=square",
      },
      {
        id: 102,
        name: "春笋 500g 新鲜",
        price: 15.99,
        originalPrice: 19.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20bamboo%20shoots%20spring&image_size=square",
      },
      {
        id: 103,
        name: "春茶 250g 明前茶",
        price: 89.99,
        originalPrice: 129.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spring%20tea%20green%20tea&image_size=square",
      },
      {
        id: 104,
        name: "芦笋 500g 新鲜",
        price: 19.99,
        originalPrice: 24.99,
        image:
          "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20asparagus%20spring&image_size=square",
      },
    ];
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
    // 静默处理错误，不显示错误日志
    // console.error("获取购物车数据失败:", error);
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
      <!-- 轮播图和分类区域 -->
      <div class="hero-category-container" v-if="!showSearchResults">
        <!-- 分类图标区 -->
        <section class="category-icons">
          <div class="category-list">
            <div class="category-item">
              <a href="/category/fruit" class="category-link">
                <div class="category-icon">🍎</div>
                <span class="category-name">水果</span>
              </a>
            </div>
            <div class="category-item">
              <a href="/category/vegetable" class="category-link">
                <div class="category-icon">🥬</div>
                <span class="category-name">蔬菜</span>
              </a>
            </div>
            <div class="category-item">
              <a href="/category/meat" class="category-link">
                <div class="category-icon">🥩</div>
                <span class="category-name">肉禽蛋</span>
              </a>
            </div>
            <div class="category-item">
              <a href="/category/seafood" class="category-link">
                <div class="category-icon">🐟</div>
                <span class="category-name">水产</span>
              </a>
            </div>
            <div class="category-item">
              <a href="/category/grain" class="category-link">
                <div class="category-icon">🌾</div>
                <span class="category-name">粮油</span>
              </a>
            </div>
            <div class="category-item">
              <a href="/category/dry" class="category-link">
                <div class="category-icon">🌰</div>
                <span class="category-name">干货</span>
              </a>
            </div>
          </div>
        </section>
        <!-- 轮播图 -->
        <section class="hero">
          <Carousel @view-detail="handleViewDetail" />
        </section>
      </div>

      <!-- 春季限定 -->
      <section class="spring-limited" v-if="!showSearchResults">
        <h2 class="section-title">春季限定</h2>
        <div class="spring-scroll">
          <div class="spring-card" v-for="item in springLimited" :key="item.id">
            <img :src="item.image" :alt="item.name" class="spring-image" />
            <div class="spring-info">
              <h3 class="spring-name">{{ item.name }}</h3>
              <div class="spring-price">¥{{ item.price }}</div>
              <button class="spring-buy-btn" @click="handleViewDetail(item)">
                立即抢购
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 今日爆款 -->
      <ProductList
        v-if="!showSearchResults"
        id="today-hot"
        title="今日爆款"
        :products="todayHot"
        @add-to-cart="handleAddToCart"
        @view-detail="handleViewDetail"
      />

      <!-- 限时秒杀 -->
      <section class="seckill-section" v-if="!showSearchResults">
        <div class="seckill-header">
          <h2 class="section-title">限时秒杀</h2>
          <div class="countdown">
            <span class="countdown-label">剩余时间：</span>
            <div class="countdown-time">
              <span class="time-box">02</span>
              <span class="time-separator">:</span>
              <span class="time-box">30</span>
              <span class="time-separator">:</span>
              <span class="time-box">45</span>
            </div>
          </div>
        </div>
        <ProductList
          id="seckill-products"
          :products="seckillProducts"
          @add-to-cart="handleAddToCart"
          @view-detail="handleViewDetail"
        />
      </section>

      <!-- 搭配套餐 -->
      <section class="combo-section" v-if="!showSearchResults">
        <h2 class="section-title">搭配套餐</h2>
        <div class="combo-list">
          <div class="combo-card" v-for="combo in combos" :key="combo.id">
            <div class="combo-images">
              <img
                v-for="(item, index) in combo.items"
                :key="index"
                :src="item.image"
                :alt="item.name"
                class="combo-item-image"
              />
            </div>
            <div class="combo-info">
              <h3 class="combo-name">{{ combo.name }}</h3>
              <div class="combo-price">
                <span class="combo-current-price"
                  >¥{{ combo.currentPrice }}</span
                >
                <span class="combo-original-price"
                  >¥{{ combo.originalPrice }}</span
                >
                <span class="combo-save">省 ¥{{ combo.save }}</span>
              </div>
              <button class="combo-buy-btn" @click="handleBuyCombo(combo)">
                立即购买
              </button>
            </div>
          </div>
        </div>
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

      <!-- 服务保障 -->
      <section class="service-guarantee" v-if="!showSearchResults">
        <div class="service-list">
          <div class="service-item">
            <div class="service-icon">🚚</div>
            <span class="service-text">满¥99包邮</span>
          </div>
          <div class="service-item">
            <div class="service-icon">⏰</div>
            <span class="service-text">48小时发货</span>
          </div>
          <div class="service-item">
            <div class="service-icon">🛡️</div>
            <span class="service-text">坏果包赔</span>
          </div>
          <div class="service-item">
            <div class="service-icon">🌱</div>
            <span class="service-text">农场直供</span>
          </div>
          <div class="service-item">
            <div class="service-icon">📞</div>
            <span class="service-text">7x24小时客服</span>
          </div>
        </div>
      </section>

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
  padding: 1rem;
  box-sizing: border-box;
  background-color: #ffffff;
  border-radius: 12px;
}

/* 轮播图和分类区域布局 */
.hero-category-container {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  margin: 1rem 0;
  padding: 0 1rem;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
  justify-content: flex-start;
}

.hero-category-container .category-icons {
  flex: 0 0 200px;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-category-container .hero {
  flex: 1;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.hero-category-container .category-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
}

.hero-category-container .category-item {
  flex: 1;
}

.hero-category-container .category-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: left;
  padding: 0.625rem 1rem;
  height: 100%;
  box-sizing: border-box;
  gap: 0.75rem;
}

.hero-category-container .category-icon {
  font-size: 1.25rem;
  margin: 0;
}

.hero-category-container .category-name {
  font-size: 0.875rem;
  margin: 0;
}

/* 通用section样式 */
section {
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 1200px) {
  .hero {
    margin: 0.75rem 0;
    padding: 0.75rem;
  }
}

@media (max-width: 500px) {
  .hero {
    margin: 0.5rem 0;
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .hero {
    margin: 0.25rem 0;
    padding: 0.25rem;
  }
}

/* 今日爆款、限时秒杀、搭配套餐样式 */
.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 2rem 0 1rem 0;
  text-align: center;
  position: relative;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background-color: #4caf50;
  border-radius: 2px;
}

/* 限时秒杀样式 */
.seckill-section {
  background-color: #fff5f5;
  padding: 1.5rem;
  margin: 2rem 0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.seckill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.seckill-header .section-title {
  margin: 0;
  color: #f44336;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.countdown-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.countdown-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.time-box {
  background-color: #f44336;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: bold;
  min-width: 30px;
  text-align: center;
}

.time-separator {
  font-size: 1rem;
  font-weight: bold;
  color: #f44336;
}

/* 搭配套餐样式 */
.combo-section {
  margin: 2rem 0;
  width: 100%;
  box-sizing: border-box;
}

.combo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 0 1rem;
  width: 100%;
  box-sizing: border-box;
}

.combo-card {
  flex: 1;
  min-width: 280px;
  max-width: 400px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  box-sizing: border-box;
}

.combo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.combo-images {
  display: flex;
  width: 100%;
  height: 180px;
  overflow: hidden;
  box-sizing: border-box;
}

.combo-item-image {
  flex: 1;
  width: 50%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
  box-sizing: border-box;
}

.combo-card:hover .combo-item-image {
  transform: scale(1.05);
}

.combo-info {
  padding: 1rem;
  box-sizing: border-box;
}

.combo-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.combo-price {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
}

.combo-current-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #f44336;
}

.combo-original-price {
  font-size: 0.875rem;
  color: #999;
  text-decoration: line-through;
}

.combo-save {
  font-size: 0.75rem;
  color: #f44336;
  font-weight: 600;
  background-color: rgba(244, 67, 54, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.combo-buy-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);
  box-sizing: border-box;
}

.combo-buy-btn:hover {
  background-color: #f57c00;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 152, 0, 0.4);
}

/* 响应式样式 */
@media (max-width: 1024px) {
  .hero-category-container {
    gap: 1.5rem;
  }

  .hero-category-container .category-icons {
    flex: 0 0 180px;
  }

  .hero-category-container .category-link {
    padding: 0.5rem 0.875rem;
  }

  .hero-category-container .category-icon {
    font-size: 1.125rem;
  }

  .hero-category-container .category-name {
    font-size: 0.8125rem;
  }
}

@media (max-width: 500px) {
  .hero-category-container {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }

  .hero-category-container .category-icons {
    flex: none;
    width: 100%;
  }

  .hero-category-container .category-list {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .hero-category-container .category-item {
    flex: 0 0 25%;
  }

  .hero-category-container .category-link {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .hero-category-container .category-icon {
    font-size: 1.5rem;
    margin: 0;
  }

  .hero-category-container .category-name {
    font-size: 0.8125rem;
    margin: 0;
  }

  .seckill-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }

  .combo-list {
    flex-direction: column;
    padding: 0 0.75rem;
    gap: 1rem;
  }

  .combo-images {
    height: 120px;
  }

  .combo-info {
    padding: 0.75rem;
  }

  .combo-name {
    font-size: 1rem;
  }

  .combo-current-price {
    font-size: 1.125rem;
  }

  .spring-card {
    flex: 0 0 200px;
  }

  .spring-image {
    height: 140px;
  }

  .spring-info {
    padding: 0.75rem;
  }

  .spring-name {
    font-size: 1rem;
  }

  .spring-price {
    font-size: 1.125rem;
  }

  .spring-buy-btn {
    padding: 0.625rem;
    font-size: 0.75rem;
  }

  .service-list {
    gap: 1rem;
  }

  .service-item {
    min-width: 100px;
    padding: 0.75rem;
  }

  .service-icon {
    font-size: 1.25rem;
  }

  .service-text {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .hero-category-container {
    gap: 1rem;
  }

  .hero-category-container .category-item {
    flex: 0 0 50%;
  }

  .hero-category-container .category-link {
    padding: 0.625rem;
    gap: 0.375rem;
  }

  .hero-category-container .category-icon {
    font-size: 1.5rem;
  }

  .hero-category-container .category-name {
    font-size: 0.75rem;
  }

  .seckill-section {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.125rem;
  }

  .combo-list {
    flex-direction: column;
    gap: 0.75rem;
  }

  .combo-images {
    height: 100px;
  }

  .combo-info {
    padding: 0.625rem;
  }

  .combo-name {
    font-size: 0.875rem;
  }

  .combo-current-price {
    font-size: 1rem;
  }

  .combo-buy-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .spring-card {
    flex: 0 0 160px;
  }

  .spring-image {
    height: 120px;
  }

  .spring-info {
    padding: 0.625rem;
  }

  .spring-name {
    font-size: 0.875rem;
  }

  .spring-price {
    font-size: 1rem;
  }

  .spring-buy-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .service-list {
    flex-direction: column;
    align-items: stretch;
  }

  .service-item {
    flex-direction: row;
    justify-content: center;
    min-width: auto;
    padding: 0.625rem;
  }

  .service-icon {
    font-size: 1.125rem;
    margin-right: 0.5rem;
  }

  .service-text {
    font-size: 0.75rem;
  }

  .seckill-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .countdown-time {
    gap: 0.125rem;
  }

  .time-box {
    min-width: 24px;
    padding: 0.125rem 0.375rem;
    font-size: 0.75rem;
  }
}

/* 分类图标区样式 */
.category-icons {
  margin: 2rem 0;
  padding: 0 1rem;
  width: 100%;
  box-sizing: border-box;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
}

.category-link {
  text-decoration: none;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  padding: 1rem;
  border-radius: 12px;
  background-color: #f7f8f9;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}

.category-link:hover {
  background-color: rgba(46, 172, 112, 0.1);
  transform: translateY(-2px);
}

.category-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.category-name {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* 春季限定样式 */
.spring-limited {
  margin: 2rem 0;
  padding: 0 1rem;
  width: 100%;
  box-sizing: border-box;
}

.spring-scroll {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 1rem 0;
  scrollbar-width: thin;
  scrollbar-color: #2eac70 #f7f8f9;
  width: 100%;
  box-sizing: border-box;
}

.spring-scroll::-webkit-scrollbar {
  height: 6px;
}

.spring-scroll::-webkit-scrollbar-track {
  background: #f7f8f9;
  border-radius: 3px;
}

.spring-scroll::-webkit-scrollbar-thumb {
  background-color: #2eac70;
  border-radius: 3px;
}

.spring-card {
  flex: 0 0 280px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s;
  box-sizing: border-box;
}

.spring-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.spring-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
}

.spring-info {
  padding: 1rem;
  box-sizing: border-box;
}

.spring-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spring-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2eac70;
  margin-bottom: 1rem;
}

.spring-buy-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #ff6b35;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(255, 107, 53, 0.3);
  box-sizing: border-box;
}

.spring-buy-btn:hover {
  background-color: #e55a2b;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 107, 53, 0.4);
}

/* 服务保障样式 */
.service-guarantee {
  margin: 3rem 0;
  padding: 2rem 1rem;
  background-color: #f7f8f9;
  border-radius: 12px;
  width: 100%;
  box-sizing: border-box;
}

.service-list {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  min-width: 100px;
  flex: 1;
  max-width: 150px;
  box-sizing: border-box;
}

.service-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.service-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.service-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* 响应式样式 - 分类图标区 */
@media (max-width: 1024px) {
  .category-list {
    flex-wrap: wrap;
  }

  .spring-card {
    flex: 0 0 240px;
  }

  .spring-image {
    height: 160px;
  }
}

@media (max-width: 500px) {
  .category-list {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .category-link {
    padding: 0.75rem;
  }

  .category-icon {
    font-size: 1.75rem;
  }

  .category-name {
    font-size: 0.8125rem;
  }

  .spring-card {
    flex: 0 0 200px;
  }

  .spring-image {
    height: 140px;
  }

  .spring-info {
    padding: 0.75rem;
  }

  .spring-name {
    font-size: 1rem;
  }

  .spring-price {
    font-size: 1.125rem;
  }

  .spring-buy-btn {
    padding: 0.625rem;
    font-size: 0.75rem;
  }

  .service-list {
    gap: 1rem;
  }

  .service-item {
    min-width: 100px;
    padding: 0.75rem;
  }

  .service-icon {
    font-size: 1.25rem;
  }

  .service-text {
    font-size: 0.75rem;
  }

  .combo-list {
    flex-direction: column;
    gap: 1rem;
  }

  .combo-images {
    height: 120px;
  }

  .combo-info {
    padding: 0.75rem;
  }

  .combo-name {
    font-size: 1rem;
  }

  .combo-current-price {
    font-size: 1.125rem;
  }

  .combo-buy-btn {
    padding: 0.625rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .category-list {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .category-link {
    padding: 0.625rem;
  }

  .category-icon {
    font-size: 1.5rem;
  }

  .category-name {
    font-size: 0.75rem;
  }

  .spring-card {
    flex: 0 0 160px;
  }

  .spring-image {
    height: 120px;
  }

  .spring-info {
    padding: 0.625rem;
  }

  .spring-name {
    font-size: 0.875rem;
  }

  .spring-price {
    font-size: 1rem;
  }

  .spring-buy-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .service-list {
    flex-direction: column;
    align-items: stretch;
  }

  .service-item {
    flex-direction: row;
    justify-content: center;
    min-width: auto;
    padding: 0.625rem;
  }

  .service-icon {
    font-size: 1.125rem;
    margin-right: 0.5rem;
  }

  .service-text {
    font-size: 0.75rem;
  }

  .combo-images {
    height: 100px;
  }

  .combo-info {
    padding: 0.625rem;
  }

  .combo-name {
    font-size: 0.875rem;
  }

  .combo-current-price {
    font-size: 1rem;
  }

  .combo-buy-btn {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .section-title {
    font-size: 1.125rem;
  }

  .seckill-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .countdown-time {
    gap: 0.125rem;
  }

  .time-box {
    min-width: 24px;
    padding: 0.125rem 0.375rem;
    font-size: 0.75rem;
  }
}

/* 今日爆款 弹性布局样式 */
#today-hot .products-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

/* 搭配套餐 弹性布局样式 */
.combo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 0 1rem;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 1024px) {
  .combo-list {
    flex-wrap: wrap;
  }
}

@media (max-width: 500px) {
  .combo-list {
    flex-direction: column;
  }
}
</style>
