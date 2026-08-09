"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import Button from "@/components/ui/Button";
import BannerCarousel from "@/components/ui/BannerCarousel";
import BottomNav from "@/components/BottomNav";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { listarMinhasColetas } from "@/lib/api/coletas";
import type { Coleta } from "@/lib/api/types";
import { COLLECTION_STATUS_META } from "@/lib/mocks/collections";
import { mapStatusColeta } from "@/lib/statusMap";
import { WasteTypeIcon } from "@/lib/wasteTypeIcons";
import { formatDateTime } from "@/lib/format";

const UPCOMING_STATUS = new Set(["AGUARDANDO", "ACEITA", "A_CAMINHO"]);

function estimatedPoints(coleta: Coleta) {
  const fator = Number(coleta.tipoResiduo.fatorPontuacaoPorKg);
  const peso = Number(coleta.quantidadeEstimadaKg);
  return Math.round(fator * peso * 10) / 10;
}

export default function DoadorDashboardPage() {
  const { user, isLoading } = useRequireAuth("DOADOR");
  const [collections, setCollections] = useState<Coleta[] | null>(null);

  useEffect(() => {
    if (!user) return;
    listarMinhasColetas()
      .then((all) => setCollections(all.filter((c) => UPCOMING_STATUS.has(c.status))))
      .catch(() => setCollections([]));
  }, [user]);

  if (isLoading || !user) return null;

  const firstName = user.nome.split(" ")[0];
  const pointsBalance = user.doador?.saldoPontos ?? 0;

  return (
    <main className="flex min-h-screen flex-col bg-gov-bg pb-24">
      <header className="px-6 pt-8 pb-4">
        <div className="mx-auto flex w-full max-w-sm items-center justify-between">
          <div>
            <p className="text-sm text-gov-navy/55">Olá,</p>
            <h1 className="text-lg font-bold text-gov-navy">{firstName}</h1>
          </div>
          <Link
            href="/notificacoes"
            aria-label="Notificações"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-gov-navy/10"
          >
            <Bell className="h-5 w-5 text-gov-navy/70" />
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6">
        <BannerCarousel />

        <Card className="!bg-brand-500 text-white !ring-0 !shadow-brand-700/10">
          <p className="text-sm text-white/80">Seu saldo</p>
          <p className="mt-1 text-4xl font-bold tracking-tight">
            {pointsBalance.toLocaleString("pt-BR")}
          </p>
          <p className="text-sm text-white/80">pontos</p>
          <Link
            href="/doador/pontos"
            className="mt-3 inline-block text-xs font-semibold text-white underline underline-offset-2"
          >
            Ver extrato e converter
          </Link>
        </Card>

        <Button href="/doador/sinalizar">
          <Plus className="h-4 w-4" />
          Sinalizar resíduo
        </Button>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gov-navy">Próximas coletas</h2>
            <Link
              href="/doador/coletas"
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              Ver histórico
            </Link>
          </div>

          {collections === null ? (
            <Card className="text-center text-sm text-gov-navy/55">Carregando...</Card>
          ) : collections.length === 0 ? (
            <Card className="text-center text-sm text-gov-navy/55">
              Nenhuma coleta agendada no momento.
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
                        {collection.quantidadeEstimadaKg} kg estimados
                        {collection.endereco ? ` · ${collection.endereco.bairro}` : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-gov-navy/40">
                        {formatDateTime(collection.dataSolicitacao)}
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
        </section>
      </div>

      <BottomNav role="doador" />
    </main>
  );
}
