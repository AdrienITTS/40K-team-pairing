import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/how-it-works',
      name: 'how-it-works',
      component: () => import('../views/HowItWorksView.vue'),
    },
    {
      path: '/pairing',
      name: 'pairing',
      component: () => import('../views/PairingView.vue'),
    },
    {
      path: '/factions',
      name: 'factions',
      component: () => import('../views/FactionsView.vue'),
    },
    {
      path: '/secondaries',
      name: 'secondaries',
      component: () => import('../views/SecondariesView.vue'),
    },
  ],
})

export default router
