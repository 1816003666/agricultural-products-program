<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { favoriteAPI } from "../services/api";
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";

const router = useRouter();
const favorites = ref([]);
const loading = ref(false);
const error = ref("");
const showProductDetail = ref(false);
const selectedProduct = ref(null);

const fetchFavorites = async () => {
  try {
    loading.value = true;
    const response = await favoriteAPI.getFavorites({ limit: 100 });
    favorites.value = response.favorites || [];
  } catch (err) {
    console.error("获取收藏列表失败:", err);
    error.value = "获取收藏列表失败";
  } finally {
    loading.value = false;
  }
};

const handleRemoveFavorite = async (productId) => {
  try {
    await favoriteAPI.removeFavorite(productId);
    await fetchFavorites();
    alert("取消收藏成功");
  } catch (err) {
    console.error("取消收藏失败:", err);
    alert("取消收藏失败，请稍后重试");
  }
};

const handleProductClick = (product) => {
  selectedProduct.value = product;
  showProductDetail.value = true;
};

const handleAddToCart = (product) => {
  console.log("添加到购物车:", product);
  alert("添加到购物车成功");
  showProductDetail.value = false;
};

const handleCloseDetail = () => {
  showProductDetail.value = false;
};

onMounted(async () => {
  await fetchFavorites();
});
</script>

<template>
  <div class="favorites-page">
    <Navbar />

    <main class="favorites-main">
      <div class="container">
        <h1>我的收藏</h1>

        <div v-if="loading" class="loading">加载中...</div>

        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-else class="favorites-container">
          <div v-if="favorites.length === 0" class="empty-favorites">
            <div class="empty-icon">❤️</div>
            <p>暂无收藏商品</p>
            <button class="browse-btn" @click="router.push('/')">去逛逛</button>
          </div>

          <div v-else class="favorites-grid">
            <div
              v-for="item in favorites"
              :key="item.id"
              class="favorite-item"
              @click="handleProductClick(item.Product)"
            >
              <div class="item-image">
                <img :src="item.Product.image" :alt="item.Product.name" />
              </div>
              <div class="item-info">
                <div class="item-name">{{ item.Product.name }}</div>
                <div class="item-price">
                  ¥{{ (Number(item.Product.price) || 0).toFixed(2) }}
                </div>
                <div class="item-stock" v-if="item.Product.stock > 0">有货</div>
                <div class="item-stock out-of-stock" v-else>缺货</div>
              </div>
              <div class="item-actions">
                <button
                  class="remove-btn"
                  @click.stop="handleRemoveFavorite(item.ProductId)"
                >
                  取消收藏
                </button>
                <button
                  class="add-cart-btn"
                  @click.stop="handleAddToCart(item.Product)"
                >
                  加入购物车
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />

    <!-- 商品详情弹窗 -->
    <div
      v-if="showProductDetail && selectedProduct"
      class="modal-overlay"
      @click="handleCloseDetail"
    >
      <div class="product-detail-modal" @click.stop>
        <div class="modal-header">
          <h2>商品详情</h2>
          <button class="close-btn" @click="handleCloseDetail">×</button>
        </div>
        <div class="modal-body">
          <div class="product-image">
            <img :src="selectedProduct.image" :alt="selectedProduct.name" />
          </div>
          <div class="product-info">
            <h3>{{ selectedProduct.name }}</h3>
            <div class="product-price">
              ¥{{ (Number(selectedProduct.price) || 0).toFixed(2) }}
            </div>
            <div class="product-description">
              {{ selectedProduct.description }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="handleCloseDetail">关闭</button>
          <button
            class="add-cart-btn"
            @click="handleAddToCart(selectedProduct)"
          >
            加入购物车
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.favorites-main {
  flex: 1;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.loading,
.error-message,
.empty-favorites {
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

.empty-favorites p {
  color: #666;
  margin-bottom: 20px;
}

.browse-btn {
  padding: 12px 24px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.browse-btn:hover {
  background-color: #45a049;
}

.favorites-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.favorite-item {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.item-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  padding: 16px;
}

.item-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  font-size: 20px;
  font-weight: bold;
  color: #f44336;
  margin-bottom: 8px;
}

.item-stock {
  font-size: 14px;
  color: #4caf50;
}

.item-stock.out-of-stock {
  color: #999;
}

.item-actions {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;
}

.remove-btn,
.add-cart-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.remove-btn {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.remove-btn:hover {
  background-color: #e0e0e0;
  color: #333;
}

.add-cart-btn {
  background-color: #4caf50;
  color: white;
}

.add-cart-btn:hover {
  background-color: #45a049;
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

.product-detail-modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
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

.product-image img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.product-info {
  margin-top: 1rem;
}

.product-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.product-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #f44336;
  margin-bottom: 1rem;
}

.product-description {
  color: #666;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
}

.cancel-btn,
.add-cart-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.add-cart-btn {
  background-color: #4caf50;
  color: white;
}

.add-cart-btn:hover {
  background-color: #45a049;
}

@media (max-width: 500px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }

  .item-actions {
    flex-direction: column;
  }
}
</style>
