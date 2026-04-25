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
    <div class="section-background">
      <div class="pattern-overlay"></div>
    </div>
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-accent"></span>
          {{ title }}
        </h2>
        <div class="section-divider"></div>
      </div>
      <div class="products-grid">
        <div v-for="(product, index) in products" :key="product.id" class="product-item" :style="{ animationDelay: `${index * 0.08}s` }">
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
  padding: 3rem 0;
  position: relative;
  overflow: hidden;
}

.section-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #f6f9f0 0%, #ffffff 50%, #f6f9f0 100%);
  z-index: -2;
}

.pattern-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(76, 130, 75, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(76, 130, 75, 0.03) 0%, transparent 40%);
  z-index: -1;
}

.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  box-sizing: border-box;
}

.section-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e3a1e;
  margin: 0 0 1rem 0;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  letter-spacing: -0.02em;
  position: relative;
}

.title-accent {
  width: 48px;
  height: 4px;
  background: linear-gradient(90deg, #4c824b 0%, #2d502c 100%);
  border-radius: 2px;
  flex-shrink: 0;
}

.section-divider {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, #4c824b 50%, transparent 100%);
  margin: 0 auto;
  border-radius: 2px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.product-item {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .container {
    max-width: 100%;
    padding: 0 1.25rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .product-list {
    padding: 2.5rem 0;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.25rem;
  }

  .container {
    padding: 0 1rem;
  }
}

@media (max-width: 500px) {
  .product-list {
    padding: 2rem 0;
  }

  .section-title {
    font-size: 1.35rem;
    flex-direction: column;
    gap: 8px;
  }

  .title-accent {
    width: 40px;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .container {
    padding: 0 0.875rem;
  }
}

@media (max-width: 480px) {
  .product-list {
    padding: 1.5rem 0;
  }

  .section-header {
    margin-bottom: 1.75rem;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.875rem;
  }

  .container {
    padding: 0 0.75rem;
  }
}
</style>
