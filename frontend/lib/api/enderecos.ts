import { apiRequest } from "./client";
import type { Endereco } from "./types";

export interface EnderecoPayload {
  apelido?: string;
  rua: string;
  bairro: string;
  latitude: number;
  longitude: number;
}

export function listarEnderecos() {
  return apiRequest<Endereco[]>("/doadores/me/enderecos");
}

export function criarEndereco(payload: EnderecoPayload) {
  return apiRequest<Endereco>("/doadores/me/enderecos", { method: "POST", body: payload });
}

export function atualizarEndereco(id: string, payload: Partial<EnderecoPayload>) {
  return apiRequest<Endereco>(`/doadores/me/enderecos/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function removerEndereco(id: string) {
  return apiRequest<void>(`/doadores/me/enderecos/${id}`, { method: "DELETE" });
}
