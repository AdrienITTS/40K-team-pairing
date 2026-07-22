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
    {
      path: '/dispositions',
      name: 'dispositions',
      component: () => import('../views/DispositionsView.vue'),
    },
    {
      path: '/primaries',
      name: 'primaries',
      component: () => import('../views/PrimariesView.vue'),
    },
    {
      path: '/layouts',
      name: 'layouts',
      component: () => import('../views/LayoutsView.vue'),
    },
    {
      path: '/analysis/vs-dispositions',
      name: 'analysis-vs-dispositions',
      component: () => import('../views/AnalysisVsDispositionsView.vue'),
    },
    {
      path: '/analysis/detachments',
      name: 'analysis-detachments',
      component: () => import('../views/AnalysisDetachmentsView.vue'),
    },
  ],
  // Smoothly return to the top on every navigation (e.g. the home page's
  // redirecting buttons/links), while preserving the saved position on
  // browser back/forward.
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    // Deep links to a chapter (e.g. the home page's feature cards → a specific
    // "How it works" section) scroll that element into view instead of the top.
    // The target view is lazily loaded, so wait a few frames for it to render
    // the anchor before resolving, otherwise the scroll finds nothing.
    if (to.hash) {
      return new Promise((resolve) => {
        let frames = 0
        const wait = () => {
          if (document.querySelector(to.hash) || frames++ > 30) {
            resolve({ el: to.hash, behavior: 'smooth' })
          } else {
            requestAnimationFrame(wait)
          }
        }
        requestAnimationFrame(wait)
      })
    }
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
