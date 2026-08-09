import type { StatusColeta } from "@/lib/api/types";
import type { CollectionStatus } from "@/lib/mocks/collections";

const STATUS_MAP: Record<StatusColeta, CollectionStatus> = {
  AGUARDANDO: "AGUARDANDO_COLETOR",
  ACEITA: "COLETA_AGENDADA",
  A_CAMINHO: "EM_ROTA",
  CONFIRMADA: "CONCLUIDA",
  CANCELADA: "CANCELADA",
};

export function mapStatusColeta(status: StatusColeta): CollectionStatus {
  return STATUS_MAP[status];
}
