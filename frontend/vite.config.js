import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
    root: './',   // raíz de frontend
    base: './'    // para rutas relativas
});
