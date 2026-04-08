import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'randolph-jawbreaking-myung.ngrok-free.dev'
    ],
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://snap-assets.al-pc-id-b.cdn.gtflabs.io https://api.sandbox.midtrans.com https://pay.google.com https://*.gopayapi.com; " +
        "connect-src 'self' http://localhost:3000 https://api.sandbox.midtrans.com https://app.sandbox.midtrans.com https://randolph-jawbreaking-myung.ngrok-free.dev; " +
        "frame-src https://app.sandbox.midtrans.com https://pay.google.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com data:; " +
        "img-src 'self' data: blob: http: https:;"
    }
  },
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})