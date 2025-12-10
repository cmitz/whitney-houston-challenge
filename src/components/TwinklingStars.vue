<template>
  <div class="twinkling-stars-container">
    <div
      v-for="star in stars"
      :key="star.id"
      class="star"
      :style="{
        left: star.x + '%',
        animation: `fall ${star.duration}ms linear forwards`,
        '--fall-distance': star.fallDistance + 'px',
        width: star.size + 'px',
        height: star.size + 'px',
        opacity: star.opacity,
      }"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const stars = ref([])
let starGenerationInterval
let starIdCounter = 0

function generateStar() {
  const newStar = {
    id: starIdCounter++,
    x: Math.random() * 100, // Random horizontal position (0-100%)
    fallDistance: Math.random() * (window.innerHeight * 0.8) + window.innerHeight * 0.2, // Random fall distance between 20-100% of viewport height
    size: Math.random() * 15 + 10, // 10px to 25px
    opacity: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
    duration: Math.random() * 3000 + 2000, // 2000ms to 5000ms
  }

  stars.value.push(newStar)

  // Remove star after animation completes
  setTimeout(() => {
    stars.value = stars.value.filter((star) => star.id !== newStar.id)
  }, newStar.duration)
}

onMounted(() => {
  // Generate a star every 200 milliseconds
  starGenerationInterval = setInterval(generateStar, 200)
})

onUnmounted(() => {
  clearInterval(starGenerationInterval)
})
</script>

<style scoped>
.twinkling-stars-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.star {
  position: fixed;
  top: 0;
  background: radial-gradient(circle at 30% 30%, #ffff99, #ffdd00, #ffaa00);
  border-radius: 50%;
  box-shadow:
    0 0 10px rgba(255, 221, 0, 0.8),
    0 0 20px rgba(255, 170, 0, 0.4);
  filter: blur(0.5px);
  pointer-events: none;
}

@keyframes fall {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(var(--fall-distance));
    opacity: 0;
  }
}
</style>
