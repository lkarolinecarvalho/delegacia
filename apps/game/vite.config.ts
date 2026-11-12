import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Caminhos relativos: o build funciona na raiz de um domínio, numa subpasta e,
  // depois, dentro do app empacotado.
  base: "./",
  plugins: [react()],
  // 5174 para conviver com o cidade-contabil, que usa a 5173.
  server: { port: 5174 },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
