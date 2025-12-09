import { createRouter, createWebHistory } from 'vue-router'
import GameControls from '../components/GameControls.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: GameControls,
    },
  ],
})

export default router
