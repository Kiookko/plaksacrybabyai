import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This prevents "process is not defined" errors in the browser
    'process.env': {} 
  }
});