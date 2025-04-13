import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '127.0.0.1', // Use a different host
    port: 5175,        // Use a different port (default is 5173)
  },
});