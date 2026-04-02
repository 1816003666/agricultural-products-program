<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentIndex = ref(0)
const interval = ref(null)

const slides = [
  {
    id: 1,
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20fruits%20and%20vegetables%20farm%20products%20promotion%20banner&image_size=landscape_16_9",
    title: "新鲜水果季",
    subtitle: "全场水果8折起",
    link: "#"
  },
  {
    id: 2,
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=organic%20vegetables%20farm%20fresh%20produce&image_size=landscape_16_9",
    title: "有机蔬菜",
    subtitle: "绿色健康，从农场到餐桌",
    link: "#"
  },
  {
    id: 3,
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20meat%20and%20eggs%20farm%20products&image_size=landscape_16_9",
    title: "肉禽蛋专场",
    subtitle: "新鲜直达，品质保证",
    link: "#"
  }
]

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % slides.length
}

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + slides.length) % slides.length
}

const goToSlide = (index) => {
  currentIndex.value = index
}

onMounted(() => {
  interval.value = setInterval(nextSlide, 5000)
})

onUnmounted(() => {
  if (interval.value) {
    clearInterval(interval.value)
  }
})
</script>

<template>
  <div class="carousel">
    <div class="carousel-container" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
      <div v-for="slide in slides" :key="slide.id" class="carousel-slide">
        <img :src="slide.image" :alt="slide.title" class="slide-image" />
        <div class="slide-content">
          <h2 class="slide-title">{{ slide.title }}</h2>
          <p class="slide-subtitle">{{ slide.subtitle }}</p>
          <a :href="slide.link" class="slide-link">立即查看</a>
        </div>
      </div>
    </div>
    
    <button class="carousel-btn carousel-btn-prev" @click="prevSlide">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <button class="carousel-btn carousel-btn-next" @click="nextSlide">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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

.slide-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.slide-subtitle {
  font-size: 1.2rem;
  margin: 0 0 2rem 0;
  line-height: 1.4;
}

.slide-link {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.slide-link:hover {
  background-color: #45a049;
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

@media (max-width: 768px) {
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