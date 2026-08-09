"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Info } from "lucide-react";
import Card from "@/components/ui/Card";
import BottomNav from "@/components/BottomNav";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { extratoPontos } from "@/lib/api/doadores";
import { buscarTaxaConversao } from "@/lib/api/prefeitura";
import type { PontosTransacao } from "@/lib/api/types";
import { formatCurrency, formatDate } from "@/lib/format";

export default function PontosPage() {
  const { user, isLoading } = useRequireAuth("DOADOR");
  const [extract, setExtract] = useState<PontosTransacao[] | null>(null);
  const [pointsPerBrl, setPointsPerBrl] = useState(100);

  useEffect(() => {
    if (!user) return;
    extratoPontos()
      .then(setExtract)
      .catch(() => setExtract([]));
    buscarTaxaConversao()
      .then((taxa) => setPointsPerBrl(1 / Number(taxa.valorPorPonto)))
      .catch(() => {});
  }, [user]);

  if (isLoading || !user) return null;

  const pointsBalance = user.doador?.saldoPontos ?? 0;
  const balanceInBrl = pointsBalance / pointsPerBrl;

  return (
    <main className="flex min-h-screen flex-col bg-gov-bg pb-24">
      <header className="px-6 pt-8 pb-4">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-lg font-bold text-gov-navy">Meus pontos</h1>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6">
        <Card className="!bg-brand-500 text-white !ring-0 !shadow-brand-700/10">
          <p className="text-sm text-white/80">Seu saldo</p>
          <p className="mt-1 text-4xl font-bold tracking-tight">
            {pointsBalance.toLocaleString("pt-BR")}
          </p>
          <p className="text-sm text-white/80">
            pontos · ≈ {formatCurrency(balanceInBrl)} em moeda social
          </p>
        </Card>

        <Card className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gov-blue/10 text-gov-blue">
            <Info className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-gov-navy">
              {Math.round(pointsPerBrl)} pontos = {formatCurrency(1)}
            </p>
            <p className="mt-0.5 text-xs text-gov-navy/50">
              A Prefeitura converte seu saldo em moeda social automaticamente no fim de cada mês.
            </p>
          </div>
        </Card>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gov-navy">Extrato</h2>

          <div className="flex flex-col gap-2">
            {extract === null ? (
              <Card className="text-center text-sm text-gov-navy/55">Carregando...</Card>
            ) : extract.length === 0 ? (
              <Card className="text-center text-sm text-gov-navy/55">
                Nenhuma pontuação registrada ainda.
              </Card>
            ) : (
              extract.map((transaction) => (
                <Card key={transaction.id} className="flex flex-row items-center gap-3 p-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gov-navy">
                      Coleta de {transaction.coleta.tipoResiduo.nome} confirmada
                    </p>
                    <p className="text-xs text-gov-navy/45">{formatDate(transaction.data)}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-brand-600">
                    +{transaction.pontos.toLocaleString("pt-BR")}
                  </span>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>

      <BottomNav role="doador" />
    </main>
  );
}
