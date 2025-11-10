import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [], // dejar vacío, a menos que quieras excluir librerías externas
    },
  },
});
