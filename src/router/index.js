import { createRouter, createWebHistory } from 'vue-router'
import GameControls from '../components/GameControls.vue'
import POC from '../components/POC.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: GameControls,
    },
    {
      path: '/poc',
      name: 'poc',
      component: POC,
    },
  ],
})

export default router
