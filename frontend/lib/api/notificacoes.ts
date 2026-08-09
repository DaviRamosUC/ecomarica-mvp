import { apiRequest } from "./client";
import type { Notificacao } from "./types";

export function listarNotificacoes() {
  return apiRequest<Notificacao[]>("/notificacoes");
}

export function marcarNotificacaoComoLida(id: string) {
  return apiRequest<Notificacao>(`/notificacoes/${id}/lida`, { method: "PATCH" });
}
