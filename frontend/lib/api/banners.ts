import { apiRequest } from "./client";
import type { Banner } from "./types";

export function listarBanners() {
  return apiRequest<Banner[]>("/banners");
}

export function listarBannersAdmin() {
  return apiRequest<Banner[]>("/banners/admin");
}

export interface BannerPayload {
  imagemUrl: string;
  titulo?: string;
  ordem?: number;
  ativo?: boolean;
}

export function criarBanner(payload: BannerPayload) {
  return apiRequest<Banner>("/banners", { method: "POST", body: payload });
}

export function atualizarBanner(id: string, payload: Partial<BannerPayload>) {
  return apiRequest<Banner>(`/banners/${id}`, { method: "PATCH", body: payload });
}

export function removerBanner(id: string) {
  return apiRequest<void>(`/banners/${id}`, { method: "DELETE" });
}
