import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// نکته دیپلوی: سایت روی GitHub Pages با ساب‌مسیر /ghatar_Game/ بالا می‌رود،
// برای همین base ست شده. اگر دامنه اختصاصی گرفتی، base را به '/' برگردان.
export default defineConfig({
  base: '/ghatar_Game/',
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'قطار کلمه‌ها | بازی ترکیب‌خوانی',
        short_name: 'قطار کلمه‌ها',
        description: 'بازی آموزشی ترکیب‌خوانی فارسی برای کلاس اولی‌ها — ۲۰ ایستگاه، ۴۴ کلمه',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        dir: 'rtl',
        lang: 'fa',
        theme_color: '#ff8a3d',
        background_color: '#fff8e7',
        categories: ['education', 'kids', 'games'],
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // اپ‌شل + عکس‌ها + صداها آفلاین کش می‌شوند؛ API کش نمی‌شود (بازی fallback محلی دارد)
        globPatterns: ['**/*.{js,css,html,svg,png,json,webmanifest}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      }
    })
  ]
})
