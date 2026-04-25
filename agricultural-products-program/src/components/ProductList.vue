<script setup>
import ProductCard from "./ProductCard.vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  products: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["add-to-cart", "view-detail"]);

const handleAddToCart = (product) => {
  emit("add-to-cart", product);
};

const handleViewDetail = (product) => {
  emit("view-detail", product);
};
</script>

<template>
  <section class="product-list">
    <div class="container">
      <h2 class="section-title">{{ title }}</h2>
      <div class="products-grid">
        <div v-for="product in products" :key="product.id" class="product-item">
          <ProductCard
            :product="product"
            @add-to-cart="handleAddToCart"
            @view-detail="handleViewDetail"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.product-list {
  padding: 2rem 0;
  background-color: #f9f9f9;
  width: 100%;
  box-sizing: border-box;
}

.container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.products-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.product-item {
  flex: 1;
  min-width: 200px;
  max-width: 100%;
  height: 100%;
  box-sizing: border-box;
}

@media (max-width: 1200px) {
  .container {
    max-width: 95%;
  }

  .products-grid {
    gap: 1.25rem;
  }

  .product-item {
    min-width: 180px;
  }
}

@media (max-width: 500px) {
  .product-list {
    padding: 1.5rem 0;
  }

  .container {
    padding: 0 0.75rem;
  }

  .section-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .products-grid {
    gap: 1rem;
  }

  .product-item {
    min-width: 160px;
  }
}

@media (max-width: 480px) {
  .product-list {
    padding: 1rem 0;
  }

  .container {
    padding: 0 0.5rem;
  }

  .products-grid {
    gap: 0.75rem;
  }

  .product-item {
    min-width: 140px;
  }
}
</style>
