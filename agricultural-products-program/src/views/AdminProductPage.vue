<template>
  <div class="main-content">
    <h2>产品管理</h2>
    <button @click="handleAddProduct">添加产品</button>
    <div v-if="error">{{ error }}</div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>名称</th>
          <th>价格</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.id }}</td>
          <td>{{ product.name }}</td>
          <td>¥{{ product.price }}</td>
          <td>
            <button @click="openEditModal(product)">编辑</button>
            <button @click="handleDeleteProduct(product.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { productAPI } from "../services/api";
import { useRouter } from "vue-router";

const router = useRouter();
const products = ref([]);
const error = ref("");

const fetchProducts = async () => {
  try {
    const response = await productAPI.getProducts();
    products.value = response?.data?.products || [];
  } catch (err) {
    error.value = "获取产品列表失败";
    console.error(err);
  }
};

const handleAddProduct = () => {
  router.push("/admin/products/add");
};

const handleDeleteProduct = async (id) => {
  if (confirm("确定要删除这个产品吗？")) {
    try {
      await productAPI.deleteProduct(id);
      await fetchProducts();
    } catch (err) {
      error.value = "删除产品失败";
      console.error(err);
    }
  }
};

const openEditModal = (product) => {
  console.log("编辑产品:", product);
};

onMounted(async () => {
  await fetchProducts();
});
</script>

<style scoped>
.main-content {
  padding: 1.5rem;
}

button {
  margin: 0.5rem;
  padding: 0.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}
</style>
