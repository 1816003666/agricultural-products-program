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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.product-item {
  height: 100%;
  box-sizing: border-box;
}

@media (max-width: 1200px) {
  .container {
    max-width: 95%;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.25rem;
  }
}

@media (max-width: 768px) {
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
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .product-list {
    padding: 1rem 0;
  }

  .container {
    padding: 0 0.5rem;
  }

  .section-title {
    font-size: 1.125rem;
    margin-bottom: 0.75rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
</style>
