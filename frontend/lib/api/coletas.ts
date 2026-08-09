import { apiRequest } from "./client";
import type { Coleta, StatusColeta } from "./types";

export interface CriarColetaPayload {
  tipoResiduoId: string;
  enderecoId: string;
  quantidadeEstimadaKg: number;
  fotoEvidenciaUrl?: string;
}

export function criarColeta(payload: CriarColetaPayload) {
  return apiRequest<Coleta>("/coletas", { method: "POST", body: payload });
}

export function listarMinhasColetas(status?: StatusColeta) {
  return apiRequest<Coleta[]>("/coletas", { query: { status } });
}

export function listarColetasDisponiveis(lat: number, lng: number, raioKm = 5) {
  return apiRequest<Coleta[]>("/coletas/disponiveis", { query: { lat, lng, raioKm } });
}

export function aceitarColeta(id: string) {
  return apiRequest<Coleta>(`/coletas/${id}/aceitar`, { method: "POST" });
}

export interface ConfirmarColetaPayload {
  quantidadeRealKg: number;
  fotoEvidenciaUrl: string;
}

export function confirmarColeta(id: string, payload: ConfirmarColetaPayload) {
  return apiRequest<Coleta>(`/coletas/${id}/confirmar`, { method: "POST", body: payload });
}

export function cancelarColeta(id: string) {
  return apiRequest<Coleta>(`/coletas/${id}/cancelar`, { method: "POST" });
}
