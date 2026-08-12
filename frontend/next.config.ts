import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produz um build de servidor mínimo (só os arquivos necessários em
  // .next/standalone) — usado pelo Dockerfile de produção.
  output: "standalone",
};

export default nextConfig;
