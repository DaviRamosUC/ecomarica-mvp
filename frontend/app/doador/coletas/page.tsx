"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import { COLLECTION_STATUS_META, type CollectionStatus } from "@/lib/mocks/collections";
import { WasteTypeIcon } from "@/lib/wasteTypeIcons";
import { mapStatusColeta } from "@/lib/statusMap";
import { formatDate } from "@/lib/format";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { listarMinhasColetas } from "@/lib/api/coletas";
import type { Coleta } from "@/lib/api/types";

type FilterValue = "TODAS" | CollectionStatus;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "TODAS", label: "Todas" },
  ...(Object.entries(COLLECTION_STATUS_META) as [CollectionStatus, { label: string }][]).map(
    ([value, meta]) => ({ value, label: meta.label })
  ),
];

function estimatedPoints(coleta: Coleta) {
  const fator = Number(coleta.tipoResiduo.fatorPontuacaoPorKg);
  const peso = Number(coleta.quantidadeRealKg ?? coleta.quantidadeEstimadaKg);
  return Math.round(fator * peso * 10) / 10;
}

export default function HistoricoColetasPage() {
  const { user, isLoading } = useRequireAuth("DOADOR");
  const [allCollections, setAllCollections] = useState<Coleta[] | null>(null);
  const [filter, setFilter] = useState<FilterValue>("TODAS");

  useEffect(() => {
    if (!user) return;
    listarMinhasColetas()
      .then(setAllCollections)
      .catch(() => setAllCollections([]));
  }, [user]);

  const collections = useMemo(() => {
    if (!allCollections) return [];
    const sorted = [...allCollections].sort(
      (a, b) => new Date(b.dataSolicitacao).getTime() - new Date(a.dataSolicitacao).getTime()
    );
    return filter === "TODAS"
      ? sorted
      : sorted.filter((c) => mapStatusColeta(c.status) === filter);
  }, [allCollections, filter]);

  if (isLoading || !user) return null;

  return (
    <main className="flex min-h-screen flex-col bg-gov-bg px-6 py-8">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/doador/dashboard"
            aria-label="Voltar"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gov-navy/10"
          >
            <ChevronLeft className="h-5 w-5 text-gov-navy/70" />
          </Link>
          <h1 className="text-lg font-bold text-gov-navy">Histórico de coletas</h1>
        </div>

        <div className="-mx-6 mb-5 flex gap-2 overflow-x-auto px-6 pb-1">
          {FILTERS.map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-brand-500 text-white"
                    : "bg-white text-gov-navy/55 ring-1 ring-gov-navy/10"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {allCollections === null ? (
          <Card className="text-center text-sm text-gov-navy/55">Carregando...</Card>
        ) : collections.length === 0 ? (
          <Card className="text-center text-sm text-gov-navy/55">
            Nenhuma coleta encontrada para este filtro.
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {collections.map((collection) => {
              const statusMeta = COLLECTION_STATUS_META[mapStatusColeta(collection.status)];

              return (
                <Card key={collection.id} className="flex flex-row items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <WasteTypeIcon nome={collection.tipoResiduo.nome} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gov-navy">
                      {collection.tipoResiduo.nome}
                    </p>
                    <p className="truncate text-xs text-gov-navy/50">
                      {collection.quantidadeRealKg ?? collection.quantidadeEstimadaKg} kg ·{" "}
                      {formatDate(collection.dataSolicitacao)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <StatusPill label={statusMeta.label} tone={statusMeta.tone} />
                    <span className="text-[11px] font-semibold text-brand-600">
                      +{estimatedPoints(collection)} pts
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
