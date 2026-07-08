import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// Hash history keeps deep links (e.g. /secondaries) working when the app is
// served as static files, where there is no server to rewrite unknown paths
// back to index.html.
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
