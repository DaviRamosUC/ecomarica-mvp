"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Bell } from "lucide-react";
import Card from "@/components/ui/Card";
import StatusPill from "@/components/ui/StatusPill";
import BottomNav from "@/components/BottomNav";
import { COLLECTION_STATUS_META } from "@/lib/mocks/collections";
import { WasteTypeIcon } from "@/lib/wasteTypeIcons";
import { mapStatusColeta } from "@/lib/statusMap";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { aceitarColeta, listarColetasDisponiveis, listarMinhasColetas } from "@/lib/api/coletas";
import type { Coleta } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import { getCurrentPosition } from "@/lib/geolocation";
import { cacheCollections } from "@/lib/collectionCache";

const MapView = dynamic(() => import("@/components/ui/MapView"), {
  ssr: false,
  loading: () => <div className="h-48 w-full animate-pulse rounded-2xl bg-brand-50" />,
});

function isToday(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function ColetorDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useRequireAuth("COLETOR");
  const [pendingCollections, setPendingCollections] = useState<Coleta[] | null>(null);
  const [myCollections, setMyCollections] = useState<Coleta[] | null>(null);
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getCurrentPosition()
      .then((pos) => {
        setPosition(pos);
        return listarColetasDisponiveis(pos.latitude, pos.longitude);
      })
      .then((coletas) => {
        setPendingCollections(coletas);
        cacheCollections(coletas);
      })
      .catch(() => setPendingCollections([]));

    listarMinhasColetas()
      .then(setMyCollections)
      .catch(() => setMyCollections([]));
  }, [user]);

  const handleAccept = async (collectionId: string) => {
    setAcceptError(null);
    setAcceptingId(collectionId);
    try {
      await aceitarColeta(collectionId);
      router.push(`/coletor/rota?stop=${collectionId}`);
    } catch (err) {
      setAcceptError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível aceitar esta coleta. Tente novamente."
      );
      setAcceptingId(null);
      setPendingCollections((prev) => prev?.filter((c) => c.id !== collectionId) ?? prev);
    }
  };

  if (isLoading || !user) return null;

  const firstName = user.nome.split(" ")[0];
  const collections = pendingCollections ?? [];

  const confirmedToday = (myCollections ?? []).filter(
    (c) => c.status === "CONFIRMADA" && c.dataColeta && isToday(c.dataColeta)
  );
  const collectionsCompletedToday = confirmedToday.length;
  const totalWeightCollectedTodayKg = confirmedToday.reduce(
    (sum, c) => sum + Number(c.quantidadeRealKg ?? 0),
    0
  );

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
        <div className="flex flex-col gap-2">
          {position ? (
            <MapView
              className="h-48 w-full"
              center={{ lat: position.latitude, lng: position.longitude }}
              markers={collections.map((collection) => ({
                id: collection.id,
                lat: collection.latitude,
                lng: collection.longitude,
                label: `${collection.tipoResiduo.nome} · ${collection.endereco?.rua ?? ""}`,
              }))}
            />
          ) : (
            <div className="h-48 w-full animate-pulse rounded-2xl bg-brand-50" />
          )}
          <p className="text-xs font-medium text-gov-navy/50">
            {collections.length} coletas em {user.coletor?.areaAtuacao ?? "sua área"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <Card className="items-center gap-0.5 p-3 text-center">
            <p className="text-lg font-bold text-gov-navy">{collectionsCompletedToday}</p>
            <p className="text-[11px] leading-tight text-gov-navy/50">concluídas hoje</p>
          </Card>
          <Card className="items-center gap-0.5 p-3 text-center">
            <p className="text-lg font-bold text-gov-navy">{totalWeightCollectedTodayKg} kg</p>
            <p className="text-[11px] leading-tight text-gov-navy/50">coletados hoje</p>
          </Card>
          <Card className="items-center gap-0.5 p-3 text-center">
            <p className="text-lg font-bold text-gov-navy">{collections.length}</p>
            <p className="text-[11px] leading-tight text-gov-navy/50">pendentes</p>
          </Card>
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gov-navy">Coletas na sua área</h2>
            <Link
              href="/coletor/rota"
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              Ver rota
            </Link>
          </div>

          {acceptError && (
            <p className="rounded-xl bg-gov-red/10 px-3.5 py-2.5 text-xs font-medium text-gov-red">
              {acceptError}
            </p>
          )}

          {pendingCollections === null ? (
            <Card className="text-center text-sm text-gov-navy/55">Carregando...</Card>
          ) : collections.length === 0 ? (
            <Card className="text-center text-sm text-gov-navy/55">
              Nenhuma coleta pendente na sua área.
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {collections.map((collection) => {
                const statusMeta = COLLECTION_STATUS_META[mapStatusColeta(collection.status)];
                const isAccepting = acceptingId === collection.id;

                return (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => handleAccept(collection.id)}
                    disabled={acceptingId !== null}
                    className="text-left disabled:opacity-60"
                  >
                    <Card className="flex flex-row items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <WasteTypeIcon nome={collection.tipoResiduo.nome} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gov-navy">
                          {collection.tipoResiduo.nome}
                        </p>
                        <p className="truncate text-xs text-gov-navy/50">
                          {collection.quantidadeEstimadaKg} kg · {collection.endereco?.rua}
                        </p>
                      </div>
                      <StatusPill
                        label={isAccepting ? "Aceitando..." : statusMeta.label}
                        tone={statusMeta.tone}
                      />
                    </Card>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <BottomNav role="coletor" />
    </main>
  );
}
