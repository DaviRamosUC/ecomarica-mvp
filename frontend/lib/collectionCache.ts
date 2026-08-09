import type { Coleta } from "@/lib/api/types";

// Não existe endpoint "GET /coletas/:id" no back-end (só listagens). Telas
// que navegam a partir de uma coleta já carregada guardam uma cópia aqui
// para a próxima tela reaproveitar sem precisar refazer a busca completa.
const STORAGE_KEY = "ecomarica:collectionCache";

function readCache(): Record<string, Coleta> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function cacheCollection(coleta: Coleta) {
  const cache = readCache();
  cache[coleta.id] = coleta;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

export function cacheCollections(coletas: Coleta[]) {
  const cache = readCache();
  for (const coleta of coletas) cache[coleta.id] = coleta;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

export function getCachedCollection(id: string): Coleta | null {
  return readCache()[id] ?? null;
}
