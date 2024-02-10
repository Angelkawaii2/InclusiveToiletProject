import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      includeAssets: ['./assets/logo.svg'],
      manifest: {
        name: 'InclusiveToiletProject',
        short_name: 'ToiletMarker',
        description: 'InclusiveToiletProject tool',
        theme_color: '#ffa8b8',
        icons: [
          {
            src: './assets/logo.svg',
            sizes: '192x192',
            type: 'image/svg'
          }
        ]
      })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base:'./'
})
