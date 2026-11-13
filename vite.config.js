import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base поднимается из env при деплое на GitHub Pages (subpath /<repo>/, ТЗ §11.3);
// локально остаётся '/'.
export default defineConfig(() => ({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    // Абсолютный base для тестов baseApi: undici Request не парсит относительный '/api'.
    env: { VITE_API_URL: 'http://localhost/api' },
  },
  server: {
    // host: true — слушаем и IPv4, и IPv6: VPN/прокси-клиент влияет на то,
    // куда браузер резолвит localhost, поэтому биндимся на всё детерминированно.
    host: true,
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        // 127.0.0.1 вместо localhost: Node может резолвить localhost в ::1,
        // а Kestrel слушает IPv4 — иначе спорадический ERR_CONNECTION_REFUSED.
        target: 'http://127.0.0.1:5080',
        changeOrigin: true,
      },
    },
  },
}));
