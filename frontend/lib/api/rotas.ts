import { apiRequest } from "./client";
import type { Rota } from "./types";

export function buscarRotaDeHoje(lat: number, lng: number) {
  return apiRequest<Rota>("/rotas/hoje", { query: { lat, lng } });
}
