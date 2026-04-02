<script setup>
import { ref } from "vue";
import { productAPI } from "../services/api";
import { useRouter } from "vue-router";

const router = useRouter();
const loading = ref(false);
const error = ref("");

const currentProduct = ref({
  name: "",
  description: "",
  price: "",
  stock: "",
  category_id: "",
  image: ""
});

const categories = ref([
  { id: 1, name: "水果" },
  { id: 2, name: "蔬菜" },
  { id: 3, name: "肉禽蛋" },
  { id: 4, name: "水产" },
  { id: 5, name: "粮油" },
  { id: 6, name: "干货" }
]);

const handleAddProduct = async () => {
  try {
    loading.value = true;
    await productAPI.addProduct(currentProduct.value);
    // 跳转到产品管理页面
    router.push("/admin/products");
  } catch (err) {
    error.value = "添加产品失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  // 跳转到产品管理页面
  router.push("/admin/products");
};
</script>

<template>
  <div class="main-content">
    <div class="header">
      <h2>添加产品</h2>
      <div class="header-actions">
        <button class="cancel-btn" @click="handleCancel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>取消</span>
        </button>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div class="add-product-form">
      <form @submit.prevent="handleAddProduct">
        <div class="form-group">
          <label for="name">产品名称</label>
          <input type="text" id="name" v-model="currentProduct.name" required placeholder="请输入产品名称"/>
        </div>
        <div class="form-group">
          <label for="description">产品描述</label>
          <textarea id="description" v-model="currentProduct.description" placeholder="请输入产品描述"></textarea>
        </div>
        <div class="form-group">
          <label for="price">价格</label>
          <input type="number" id="price" v-model="currentProduct.price" required placeholder="请输入价格"/>
        </div>
        <div class="form-group">
          <label for="stock">库存</label>
          <input type="number" id="stock" v-model="currentProduct.stock" required placeholder="请输入库存"/>
        </div>
        <div class="form-group">
          <label for="category_id">分类</label>
          <select id="category_id" v-model="currentProduct.category_id" required>
            <option value="">请选择分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="image">图片URL</label>
          <input type="text" id="image" v-model="currentProduct.image" placeholder="请输入图片URL"/>
        </div>
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? '提交中...' : '提交' }}
          </button>
        </div>
      </form>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.cancel-btn {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.cancel-btn svg {
  margin-right: 0.5rem;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.add-product-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  gap: 1rem;
}

.submit-btn {
  padding: 0.75rem 2rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.submit-btn:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
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

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .add-product-form {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-btn,
  .cancel-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>