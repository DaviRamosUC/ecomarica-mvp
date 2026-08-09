import { apiRequest } from "./client";
import type { AuthResponse, Papel, Usuario } from "./types";

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  papel: Extract<Papel, "DOADOR" | "COLETOR">;
  endereco?: string;
  bairro?: string;
  latitude?: number;
  longitude?: number;
  veiculo?: string;
  areaAtuacao?: string;
}

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>("/auth/login", { method: "POST", body: payload, auth: false });
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>("/auth/register", { method: "POST", body: payload, auth: false });
}

export function me() {
  return apiRequest<Usuario>("/me");
}
