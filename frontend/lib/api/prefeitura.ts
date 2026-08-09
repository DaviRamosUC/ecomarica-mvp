import { apiRequest } from "./client";
import type { DashboardPrefeitura, TaxaConversao } from "./types";

export function buscarDashboardPrefeitura() {
  return apiRequest<DashboardPrefeitura>("/prefeitura/dashboard");
}

export function buscarTaxaConversao() {
  return apiRequest<TaxaConversao>("/prefeitura/taxa-conversao");
}

export function atualizarTaxaConversao(valorPorPonto: number) {
  return apiRequest<TaxaConversao>("/prefeitura/taxa-conversao", {
    method: "PATCH",
    body: { valorPorPonto },
  });
}
