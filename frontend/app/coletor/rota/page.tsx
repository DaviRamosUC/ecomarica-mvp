"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navigation, Phone } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import BottomNav from "@/components/BottomNav";
import { WasteTypeIcon } from "@/lib/wasteTypeIcons";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { buscarRotaDeHoje } from "@/lib/api/rotas";
import type { Coleta } from "@/lib/api/types";
import { getCurrentPosition } from "@/lib/geolocation";
import { cacheCollections } from "@/lib/collectionCache";
import { buildDirectionsUrl } from "@/lib/navigation";

export default function ColetorRotaPage() {
  return (
    <Suspense fallback={null}>
      <ColetorRotaContent />
    </Suspense>
  );
}

function ColetorRotaContent() {
  const { user, isLoading } = useRequireAuth("COLETOR");
  const searchParams = useSearchParams();
  const stop = searchParams.get("stop");
  const [routeStops, setRouteStops] = useState<Coleta[] | null>(null);

  useEffect(() => {
    if (!user) return;
    getCurrentPosition()
      .then(({ latitude, longitude }) => buscarRotaDeHoje(latitude, longitude))
      .then((rota) => {
        setRouteStops(rota.coletas);
        cacheCollections(rota.coletas);
      })
      .catch(() => setRouteStops([]));
  }, [user]);

  if (isLoading || !user) return null;

  if (routeStops === null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gov-bg px-6 py-10 pb-24 text-center">
        <p className="text-sm text-gov-navy/55">Carregando rota...</p>
        <BottomNav role="coletor" />
      </main>
    );
  }

  if (routeStops.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gov-bg px-6 py-10 pb-24 text-center">
        <p className="text-sm text-gov-navy/55">Nenhuma parada na sua rota hoje.</p>
        <BottomNav role="coletor" />
      </main>
    );
  }

  const foundIndex = routeStops.findIndex((s) => s.id === stop);
  const currentIndex = foundIndex >= 0 ? foundIndex : 0;
  const currentStop = routeStops[currentIndex];
  const doadorNome = currentStop.doador?.usuario.nome ?? "Doador";
  const doadorTelefone = currentStop.doador?.usuario.telefone ?? "";

  return (
    <main className="flex min-h-screen flex-col bg-gov-bg pb-24">
      <header className="px-6 pt-8 pb-4">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-lg font-bold text-gov-navy">Rota de hoje</h1>
          <p className="mt-0.5 text-sm text-gov-navy/55">
            Parada {currentIndex + 1} de {routeStops.length}
          </p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6">
        <div className="flex gap-1.5">
          {routeStops.map((s, index) => (
            <span
              key={s.id}
              className={`h-1.5 flex-1 rounded-full ${
                index <= currentIndex ? "bg-brand-500" : "bg-gov-navy/10"
              }`}
            />
          ))}
        </div>

        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <WasteTypeIcon nome={currentStop.tipoResiduo.nome} className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                Parada atual
              </p>
              <p className="truncate text-base font-bold text-gov-navy">
                {currentStop.tipoResiduo.nome}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-gov-navy/10 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gov-navy/50">Doador</span>
              <span className="font-medium text-gov-navy">{doadorNome}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="shrink-0 text-gov-navy/50">Endereço</span>
              <span className="text-right font-medium text-gov-navy">
                {currentStop.endereco?.rua}, {currentStop.endereco?.bairro}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gov-navy/50">Quantidade estimada</span>
              <span className="font-medium text-gov-navy">
                {currentStop.quantidadeEstimadaKg} kg
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 border-t border-gov-navy/10 pt-4">
            <Button href={`/coletor/coletas/${currentStop.id}/confirmar`}>
              Confirmar coleta
            </Button>
            <Button
              href={buildDirectionsUrl(currentStop.latitude, currentStop.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
            >
              <Navigation className="h-4 w-4" />
              Traçar rota até o endereço
            </Button>
            {doadorTelefone && (
              <Button href={`tel:${doadorTelefone}`} variant="secondary">
                <Phone className="h-4 w-4" />
                Ligar para o doador
              </Button>
            )}
          </div>
        </Card>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-gov-navy">Paradas da rota</h2>
          <div className="flex flex-col gap-2">
            {routeStops.map((s, index) => {
              const isCurrent = index === currentIndex;
              const label =
                index < currentIndex ? "Visitada" : isCurrent ? "Parada atual" : "A caminho";

              return (
                <Link key={s.id} href={`/coletor/rota?stop=${s.id}`}>
                  <Card
                    className={`flex flex-row items-center gap-3 p-3 ${
                      isCurrent ? "ring-2 ring-brand-500" : ""
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        index < currentIndex
                          ? "bg-gov-navy/8 text-gov-navy/40"
                          : "bg-brand-50 text-brand-600"
                      }`}
                    >
                      <WasteTypeIcon nome={s.tipoResiduo.nome} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gov-navy">
                        {s.tipoResiduo.nome}
                      </p>
                      <p className="truncate text-xs text-gov-navy/45">{s.endereco?.rua}</p>
                    </div>
                    <span
                      className={`shrink-0 text-[11px] font-semibold ${
                        isCurrent
                          ? "text-brand-600"
                          : index < currentIndex
                            ? "text-gov-navy/35"
                            : "text-gov-navy/45"
                      }`}
                    >
                      {label}
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <BottomNav role="coletor" />
    </main>
  );
}
