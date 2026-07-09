import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {VitePWA} from 'vite-plugin-pwa'
import projectVersions from './project-versions.json'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        VitePWA({
            includeAssets: ['favicon.ico', 'logo-144.svg', 'logo-192.svg', 'logo-512.svg', '144x144.png'],
            registerType: 'autoUpdate',
            manifest: {
                name: 'InclusiveToiletProject',
                short_name: 'ToiletMarker',
                description: 'InclusiveToiletProject tool',
                start_url: './',
                scope: './',
                display: 'standalone',
                background_color: '#f7fafb',
                theme_color: '#ffa8b8',
                icons: [
                    {
                        src: './144x144.png',
                        sizes: '144x144',
                        type: 'image/png',
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
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
                runtimeCaching: [
                    {
                        urlPattern: ({url}) => url.pathname.includes('/data/'),
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'itp-static-data',
                            expiration: {
                                maxEntries: 32,
                                maxAgeSeconds: 60 * 60 * 24 * 30,
                            },
                        },
                    },
                    {
                        urlPattern: ({url}) => url.origin === 'https://tile.openstreetmap.org',
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'itp-map-tiles',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 60 * 60 * 24 * 7,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                ],
            }
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    base: './',
    define: {
        VITE_APP_VERSION: JSON.stringify(projectVersions.appVersion),
        VITE_BUILD_TIME: JSON.stringify(new Date().toLocaleString()),
        VITE_DATA_VERSION: JSON.stringify(projectVersions.dataVersion),
    }
})
