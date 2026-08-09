"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, Coins, Scale, Truck, Users } from "lucide-react";
import StatTile from "@/components/ui/StatTile";
import { formatCompactNumber } from "@/lib/format";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { buscarDashboardPrefeitura } from "@/lib/api/prefeitura";
import type { DashboardPrefeitura } from "@/lib/api/types";

export default function PrefeituraDashboardPage() {
  const { user, isLoading } = useRequireAuth("PREFEITURA");
  const [stats, setStats] = useState<DashboardPrefeitura | null>(null);

  useEffect(() => {
    if (!user) return;
    buscarDashboardPrefeitura().then(setStats).catch(() => setStats(null));
  }, [user]);

  if (isLoading || !user) return null;

  if (!stats) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-10 py-10">
        <p className="text-sm text-gov-navy/55">Carregando...</p>
      </div>
    );
  }

  const rankedNeighborhoods = [...stats.impactoPorBairro].sort(
    (a, b) => b.pesoColetadoKg - a.pesoColetadoKg
  );
  const maxWeight = rankedNeighborhoods[0]?.pesoColetadoKg ?? 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-10 py-10">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">Dashboard institucional</h1>
        <p className="mt-1 text-sm text-gov-navy/55">
          Visão geral do programa EcoMaricá de coleta seletiva.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatTile
          label="Coletas concluídas"
          value={formatCompactNumber(stats.totalColetas)}
          icon={ClipboardCheck}
        />
        <StatTile
          label="Peso total coletado"
          value={`${formatCompactNumber(stats.totalPesoColetadoKg)} kg`}
          icon={Scale}
        />
        <StatTile
          label="Pontos distribuídos"
          value={formatCompactNumber(stats.totalPontosDistribuidos)}
          icon={Coins}
        />
        <StatTile
          label="Doadores ativos"
          value={formatCompactNumber(stats.doadoresAtivos)}
          icon={Users}
        />
        <StatTile
          label="Coletores homologados"
          value={formatCompactNumber(stats.coletoresHomologados)}
          icon={Truck}
        />
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm shadow-gov-navy/5 ring-1 ring-gov-navy/5">
        <h2 className="text-sm font-bold text-gov-navy">Impacto por bairro</h2>
        <p className="mt-0.5 text-xs text-gov-navy/50">Peso total coletado, em quilogramas.</p>

        {rankedNeighborhoods.length === 0 ? (
          <p className="mt-6 text-sm text-gov-navy/55">
            Ainda não há coletas confirmadas com bairro registrado.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {rankedNeighborhoods.map((item) => (
              <div key={item.bairro} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-sm font-medium text-gov-navy/70">
                  {item.bairro}
                </span>
                <div className="h-6 flex-1 rounded-md bg-gov-navy/8">
                  <div
                    className="h-full rounded-r-md bg-brand-500"
                    style={{ width: `${(item.pesoColetadoKg / maxWeight) * 100}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-sm font-semibold text-gov-navy">
                  {item.pesoColetadoKg.toLocaleString("pt-BR")} kg
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
