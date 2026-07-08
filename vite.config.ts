import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    // Dev-tools overlay is only useful while serving; keep it out of the
    // production bundle so it isn't shipped to browsers.
    ...(command === 'serve' ? [vueDevTools()] : []),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Split the rarely-changing framework code into its own chunk so it stays
    // cached across app deploys and loads in parallel with the app code.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules\/(vue|vue-router|pinia|@vue)\//.test(id)) {
            return 'vendor'
          }
        },
      },
    },
  },
}))
