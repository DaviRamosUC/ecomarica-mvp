import { apiRequest } from "./client";
import type { Doador, PontosTransacao } from "./types";

export function buscarPerfilDoador() {
  return apiRequest<Doador>("/doadores/me");
}

export function extratoPontos() {
  return apiRequest<PontosTransacao[]>("/doadores/me/pontos");
}
