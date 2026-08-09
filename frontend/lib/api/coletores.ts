import { apiRequest } from "./client";
import type { Coletor } from "./types";

export function listarColetores() {
  return apiRequest<Coletor[]>("/coletores");
}

export function homologarColetor(usuarioId: string, homologado: boolean) {
  return apiRequest<Coletor>(`/coletores/${usuarioId}/homologar`, {
    method: "PATCH",
    body: { homologado },
  });
}
