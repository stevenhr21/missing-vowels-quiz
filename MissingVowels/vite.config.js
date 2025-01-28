import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      '4179c6af-05a5-408a-bff9-75c3a8d06bf6-00-1ajrwgefiuqjb.kirk.replit.dev'
    ],
  }
});