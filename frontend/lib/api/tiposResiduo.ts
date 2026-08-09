import { apiRequest } from "./client";
import type { TipoResiduo } from "./types";

export function listarTiposResiduo() {
  return apiRequest<TipoResiduo[]>("/tipos-residuo");
}

export function atualizarTipoResiduo(id: string, fatorPontuacaoPorKg: number) {
  return apiRequest<TipoResiduo>(`/tipos-residuo/${id}`, {
    method: "PATCH",
    body: { fatorPontuacaoPorKg },
  });
}
