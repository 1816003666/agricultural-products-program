<script setup>
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from "vue";

const props = defineProps({
  onViewDetail: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(["viewDetail"]);

const currentIndex = ref(0);
const interval = ref(null);

const slides = [
  {
    id: 1,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20spring%20strawberries%20farm%20fresh%20premium%20quality&image_size=landscape_16_9",
    title: "春季草莓季",
    subtitle: "云南高原草莓，甜蜜上市",
    tag: "限时尝鲜",
    price: "尝鲜价 ¥29.99",
    originalPrice: "原价 ¥39.99",
    link: "#",
    product: {
      id: 2,
      name: "云南高原草莓 2斤装 香甜可口",
      description: "云南高原草莓，香甜可口，新鲜直达，自然成熟",
      price: 29.99,
      originalPrice: 39.99,
      discount: 25,
      image:
        "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20strawberries%20farm%20fresh&image_size=square",
      stock: 50,
      sold: 20,
    },
  },
  {
    id: 2,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spring%20bamboo%20shoots%20fresh%20vegetables%20farm%20produce&image_size=landscape_16_9",
    title: "春笋上市",
    subtitle: "浙江临安春笋，春季限定",
    tag: "产地直发",
    price: "尝鲜价 ¥19.99",
    originalPrice: "原价 ¥29.99",
    link: "#",
    product: {
      id: 9,
      name: "春笋 500g 鲜嫩可口",
      description: "春季新鲜春笋，鲜嫩可口，营养丰富",
      price: 19.99,
      image:
        "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spring%20bamboo%20shoots%20fresh%20vegetables&image_size=square",
      stock: 100,
      sold: 30,
    },
  },
  {
    id: 3,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spring%20tea%20leaves%20fresh%20harvest%20premium%20quality&image_size=landscape_16_9",
    title: "春茶飘香",
    subtitle: "杭州西湖明前龙井，贵如金",
    tag: "限量发售",
    price: "尝鲜价 ¥199.99",
    originalPrice: "原价 ¥299.99",
    link: "#",
    product: {
      id: 25,
      name: "明前龙井 50g 清香醇厚",
      description: "春季明前龙井，清香醇厚，口感极佳",
      price: 199.99,
      image:
        "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spring%20tea%20leaves%20premium%20quality&image_size=square",
      stock: 50,
      sold: 20,
    },
  },
  {
    id: 4,
    image:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20asparagus%20spring%20vegetables%20farm%20fresh&image_size=landscape_16_9",
    title: "芦笋鲜季",
    subtitle: "山东寿光芦笋，营养丰富",
    tag: "限时优惠",
    price: "尝鲜价 ¥15.99",
    originalPrice: "原价 ¥25.99",
    link: "#",
    product: {
      id: 8,
      name: "新鲜芦笋 500g 营养丰富",
      description: "春季新鲜芦笋，营养丰富，口感鲜嫩",
      price: 15.99,
      image:
        "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20asparagus%20spring%20vegetables&image_size=square",
      stock: 80,
      sold: 40,
    },
  },
];

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % slides.length;
};

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + slides.length) % slides.length;
};

const goToSlide = (index) => {
  currentIndex.value = index;
};

const handleViewDetail = (slide) => {
  if (slide.product) {
    if (props.onViewDetail) {
      props.onViewDetail(slide.product);
    } else {
      emit("viewDetail", slide.product);
    }
  }
};

onMounted(() => {
  interval.value = setInterval(nextSlide, 5000);
});

onUnmounted(() => {
  if (interval.value) {
    clearInterval(interval.value);
  }
});
</script>

<template>
  <div class="carousel">
    <div
      class="carousel-container"
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div v-for="slide in slides" :key="slide.id" class="carousel-slide">
        <img v-lazy="slide.image" :alt="slide.title" class="slide-image" />
        <div class="slide-content">
          <div v-if="slide.tag" class="slide-tag">{{ slide.tag }}</div>
          <h2 class="slide-title">{{ slide.title }}</h2>
          <p class="slide-subtitle">{{ slide.subtitle }}</p>
          <div class="slide-price-info" v-if="slide.price">
            <span class="slide-price">{{ slide.price }}</span>
            <span v-if="slide.originalPrice" class="slide-original-price">{{
              slide.originalPrice
            }}</span>
          </div>
          <button class="slide-link" @click="handleViewDetail(slide)">
            立即抢购
          </button>
        </div>
      </div>
    </div>

    <button class="carousel-btn carousel-btn-prev" @click="prevSlide">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 18L9 12L15 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <button class="carousel-btn carousel-btn-next" @click="nextSlide">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 18L15 12L9 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div class="carousel-indicators">
      <button
        v-for="(slide, index) in slides"
        :key="slide.id"
        class="indicator"
        :class="{ active: index === currentIndex }"
        @click="goToSlide(index)"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
  box-sizing: border-box;
}

.carousel-container {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.carousel-slide {
  flex: 0 0 100%;
  position: relative;
  height: 100%;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-content {
  position: absolute;
  top: 50%;
  left: 10%;
  transform: translateY(-50%);
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  max-width: 500px;
  padding: 1rem;
  box-sizing: border-box;
}

.slide-tag {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #ff9800;
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.slide-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.slide-subtitle {
  font-size: 1.2rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.4;
}

.slide-price-info {
  margin-bottom: 2rem;
  display: flex;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
}

.slide-price {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ff9800;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.slide-original-price {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: line-through;
}

.slide-link {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: #ff9800;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);
}

.slide-link:hover {
  background-color: #f57c00;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 152, 0, 0.4);
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
  z-index: 10;
}

.carousel-btn:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

.carousel-btn-prev {
  left: 20px;
}

.carousel-btn-next {
  right: 20px;
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.indicator.active {
  background-color: white;
  width: 30px;
  border-radius: 6px;
}

@media (max-width: 1200px) {
  .carousel {
    height: 350px;
  }

  .slide-title {
    font-size: 2.2rem;
  }

  .slide-subtitle {
    font-size: 1.1rem;
  }
}

@media (max-width: 500px) {
  .carousel {
    height: 300px;
  }

  .slide-title {
    font-size: 1.8rem;
  }

  .slide-subtitle {
    font-size: 1rem;
  }

  .slide-content {
    left: 5%;
    max-width: 300px;
    padding: 0.75rem;
  }

  .carousel-btn {
    width: 40px;
    height: 40px;
  }

  .carousel-btn-prev {
    left: 10px;
  }

  .carousel-btn-next {
    right: 10px;
  }
}

@media (max-width: 480px) {
  .carousel {
    height: 250px;
  }

  .slide-title {
    font-size: 1.5rem;
  }

  .slide-subtitle {
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .slide-content {
    left: 5%;
    max-width: 250px;
    padding: 0.5rem;
  }

  .slide-link {
    padding: 0.6rem 1.2rem;
    font-size: 0.875rem;
  }

  .carousel-btn {
    width: 36px;
    height: 36px;
  }

  .carousel-indicators {
    bottom: 10px;
    gap: 8px;
  }

  .indicator {
    width: 10px;
    height: 10px;
  }

  .indicator.active {
    width: 24px;
  }
}
</style>
