export type CollectionStatus =
  | "AGUARDANDO_COLETOR"
  | "COLETA_AGENDADA"
  | "EM_ROTA"
  | "CONCLUIDA"
  | "CANCELADA";

export type StatusTone = "success" | "info" | "warning" | "neutral" | "danger";

export const COLLECTION_STATUS_META: Record<
  CollectionStatus,
  { label: string; tone: StatusTone }
> = {
  AGUARDANDO_COLETOR: { label: "Aguardando coletor", tone: "warning" },
  COLETA_AGENDADA: { label: "Agendada", tone: "info" },
  EM_ROTA: { label: "Em rota", tone: "success" },
  CONCLUIDA: { label: "Concluída", tone: "neutral" },
  CANCELADA: { label: "Cancelada", tone: "danger" },
};
