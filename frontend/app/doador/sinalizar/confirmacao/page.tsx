"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import { COLLECTION_STATUS_META } from "@/lib/mocks/collections";
import { mapStatusColeta } from "@/lib/statusMap";
import { WasteTypeIcon } from "@/lib/wasteTypeIcons";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { listarMinhasColetas } from "@/lib/api/coletas";
import { getCachedCollection } from "@/lib/collectionCache";
import type { Coleta } from "@/lib/api/types";

export default function ConfirmacaoSinalizacaoPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmacaoSinalizacaoContent />
    </Suspense>
  );
}

function ConfirmacaoSinalizacaoContent() {
  const { user, isLoading } = useRequireAuth("DOADOR");
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [collection, setCollection] = useState<Coleta | null | undefined>(() =>
    id ? (getCachedCollection(id) ?? undefined) : null
  );

  useEffect(() => {
    if (!user || !id || collection !== undefined) return;

    listarMinhasColetas()
      .then((coletas) => setCollection(coletas.find((c) => c.id === id) ?? null))
      .catch(() => setCollection(null));
  }, [user, id, collection]);

  if (isLoading || !user) return null;

  if (!collection) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gov-bg px-6 py-10 text-center">
        <div className="w-full max-w-sm">
          <p className="text-sm text-gov-navy/60">
            {collection === undefined
              ? "Carregando..."
              : "Não encontramos os detalhes dessa sinalização."}
          </p>
          {collection === null && (
            <Button href="/doador/dashboard" className="mt-4">
              Voltar ao início
            </Button>
          )}
        </div>
      </main>
    );
  }

  const statusMeta = COLLECTION_STATUS_META[mapStatusColeta(collection.status)];
  const estimatedPoints =
    Math.round(
      Number(collection.tipoResiduo.fatorPontuacaoPorKg) *
        Number(collection.quantidadeEstimadaKg) *
        10
    ) / 10;

  return (
    <main className="flex min-h-screen flex-col bg-gov-bg px-6 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-gov-navy">Coleta sinalizada!</h1>
            <p className="mt-1 text-sm text-gov-navy/55">
              Um coletor da sua região vai confirmar a coleta em breve.
            </p>
          </div>
        </div>

        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <WasteTypeIcon nome={collection.tipoResiduo.nome} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gov-navy">
                {collection.tipoResiduo.nome}
              </p>
              <p className="truncate text-xs text-gov-navy/50">
                {collection.quantidadeEstimadaKg} kg estimados
              </p>
            </div>
            <StatusPill label={statusMeta.label} tone={statusMeta.tone} />
          </div>

          <div className="flex flex-col gap-2 border-t border-gov-navy/10 pt-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="shrink-0 text-gov-navy/50">Endereço</span>
              <span className="text-right font-medium text-gov-navy">
                {collection.endereco?.rua}, {collection.endereco?.bairro}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gov-navy/50">Pontos estimados</span>
              <span className="font-bold text-brand-600">+{estimatedPoints} pts</span>
            </div>
          </div>
        </Card>

        <div className="mt-6 flex flex-col gap-3">
          <Button href="/doador/dashboard">Voltar ao início</Button>
          <Button href="/doador/sinalizar" variant="secondary">
            Sinalizar outra coleta
          </Button>
        </div>
      </div>
    </main>
  );
}
