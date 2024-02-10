import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {VitePWA} from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        VitePWA({
            includeAssets: ['./logo-192.svg'],
            manifest: {
                name: 'InclusiveToiletProject',
                short_name: 'ToiletMarker',
                description: 'InclusiveToiletProject tool',
                theme_color: '#ffa8b8',
                icons: [
                    {
                        src: './logo-144.svg',
                        sizes: '144x144',
                        type: 'image/svg',
                    },
                    {
                        src: './logo-192.svg',
                        sizes: '192x192',
                        type: 'image/svg',
                    },
                    {
                        src: './logo-512.svg',
                        sizes: '512x512',
                        type: 'image/svg',
                    },
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    base: './'
})
