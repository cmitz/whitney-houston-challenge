<template>
  <div class="twinkling-stars-container">
    <div
      v-for="star in stars"
      :key="star.id"
      class="star"
      :style="{
        left: star.x + '%',
        top: '0px',
        '--fall-distance': star.fallDistance + 'px',
        '--duration': star.duration,
        width: star.size + 'px',
        height: star.size + 'px',
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
    fallDistance: Math.random() * 400 + 200, // Random fall distance between 200-600px
    size: Math.random() * 8 + 4, // 4px to 12px
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
  background: radial-gradient(circle at 30% 30%, #ffff99, #ffdd00, #ffaa00);
  border-radius: 50%;
  box-shadow:
    0 0 15px rgba(255, 221, 0, 1),
    0 0 30px rgba(255, 170, 0, 0.8),
    0 0 45px rgba(255, 255, 0, 0.6);
  filter: blur(0.5px);
  pointer-events: none;
  animation: fall calc(var(--duration) * 1ms) linear forwards;
}

@keyframes fall {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(var(--fall-distance));
    opacity: 0;
  }
}
</style>
