"use client";

import { use, useEffect, useMemo, useRef, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ChevronLeft, ImagePlus, Minus, Plus, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import { WasteTypeIcon } from "@/lib/wasteTypeIcons";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { cancelarColeta, confirmarColeta } from "@/lib/api/coletas";
import { buscarRotaDeHoje } from "@/lib/api/rotas";
import { getCachedCollection, cacheCollections } from "@/lib/collectionCache";
import type { Coleta } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import { getCurrentPosition } from "@/lib/geolocation";
import { fileToDataUrl } from "@/lib/fileToDataUrl";

const MIN_WEIGHT = 0.5;
const MAX_WEIGHT = 100;
const WEIGHT_STEP = 0.5;

export default function ConfirmarColetaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoading } = useRequireAuth("COLETOR");

  const [collection, setCollection] = useState<Coleta | null | undefined>(() =>
    getCachedCollection(id) ?? undefined
  );
  const [actualWeightKg, setActualWeightKg] = useState(MIN_WEIGHT);
  const [weightSeededFor, setWeightSeededFor] = useState<string | null>(null);
  const [isCompatible, setIsCompatible] = useState(true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || collection !== undefined) return;
    getCurrentPosition()
      .then(({ latitude, longitude }) => buscarRotaDeHoje(latitude, longitude))
      .then((rota) => {
        cacheCollections(rota.coletas);
        setCollection(rota.coletas.find((c) => c.id === id) ?? null);
      })
      .catch(() => setCollection(null));
  }, [user, id, collection]);

  if (collection && weightSeededFor !== collection.id) {
    setWeightSeededFor(collection.id);
    setActualWeightKg(Number(collection.quantidadeEstimadaKg));
  }

  const photoPreview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  if (isLoading || !user) return null;

  if (!collection) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gov-bg px-6 py-10 text-center">
        <div className="w-full max-w-sm">
          <p className="text-sm text-gov-navy/60">
            {collection === undefined ? "Carregando..." : "Não encontramos essa coleta."}
          </p>
          {collection === null && (
            <Button href="/coletor/rota" className="mt-4">
              Voltar para a rota
            </Button>
          )}
        </div>
      </main>
    );
  }

  const actualPoints =
    Math.round(Number(collection.tipoResiduo.fatorPontuacaoPorKg) * actualWeightKg * 10) / 10;

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhoto(e.target.files?.[0] ?? null);
    setPhotoError(undefined);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!photo) {
      setPhotoError("Adicione uma foto como evidência da coleta");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isCompatible) {
        const fotoEvidenciaUrl = await fileToDataUrl(photo);
        await confirmarColeta(collection.id, { quantidadeRealKg: actualWeightKg, fotoEvidenciaUrl });
      } else {
        await cancelarColeta(collection.id);
      }
      router.push("/coletor/rota");
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Não foi possível confirmar a coleta. Tente novamente."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gov-bg px-6 py-8">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={`/coletor/rota?stop=${collection.id}`}
            aria-label="Voltar"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gov-navy/10"
          >
            <ChevronLeft className="h-5 w-5 text-gov-navy/70" />
          </Link>
          <h1 className="text-lg font-bold text-gov-navy">Confirmar coleta</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm shadow-gov-navy/5 ring-1 ring-gov-navy/5"
        >
          {submitError && (
            <p className="rounded-xl bg-gov-red/10 px-3.5 py-2.5 text-xs font-medium text-gov-red">
              {submitError}
            </p>
          )}
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <WasteTypeIcon nome={collection.tipoResiduo.nome} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gov-navy">
                {collection.tipoResiduo.nome}
              </p>
              <p className="truncate text-xs text-gov-navy/50">
                Sinalizado por {collection.doador?.usuario.nome ?? "doador"} · {collection.endereco?.rua}
              </p>
            </div>
          </div>

          <div className="border-t border-gov-navy/10 pt-5">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gov-navy/40">
              Peso real
            </span>
            <div className="flex items-center justify-between rounded-2xl border border-gov-navy/15 px-4 py-3">
              <button
                type="button"
                onClick={() =>
                  setActualWeightKg((w) => Math.max(MIN_WEIGHT, Math.round((w - WEIGHT_STEP) * 10) / 10))
                }
                disabled={actualWeightKg <= MIN_WEIGHT}
                aria-label="Diminuir peso"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gov-bg text-gov-navy disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-bold text-gov-navy">
                {actualWeightKg.toLocaleString("pt-BR")} kg
              </span>
              <button
                type="button"
                onClick={() =>
                  setActualWeightKg((w) => Math.min(MAX_WEIGHT, Math.round((w + WEIGHT_STEP) * 10) / 10))
                }
                disabled={actualWeightKg >= MAX_WEIGHT}
                aria-label="Aumentar peso"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gov-bg text-gov-navy disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gov-navy/45">
              Estimado pelo doador: {collection.quantidadeEstimadaKg} kg
            </p>
          </div>

          <div className="border-t border-gov-navy/10 pt-5">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gov-navy/40">
              Foto de evidência
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />
            {photoPreview ? (
              <div className="relative w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Prévia da foto de evidência"
                  className="h-24 w-24 rounded-xl object-cover ring-1 ring-gov-navy/10"
                />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  aria-label="Remover foto"
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gov-navy text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed py-6 ${
                  photoError
                    ? "border-gov-red/40 text-gov-red"
                    : "border-gov-navy/15 text-gov-navy/45 hover:border-gov-navy/25"
                }`}
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-xs font-semibold">Adicionar foto</span>
              </button>
            )}
            <p className="mt-1.5 text-xs text-gov-navy/45">
              Obrigatória para confirmar a coleta — camada antifraude.
            </p>
            {photoError && (
              <p className="mt-1 text-xs font-medium text-gov-red">{photoError}</p>
            )}
          </div>

          <div className="border-t border-gov-navy/10 pt-5">
            <Toggle
              checked={isCompatible}
              onChange={setIsCompatible}
              label="Resíduo compatível com o sinalizado"
              description="O material coletado corresponde ao tipo informado pelo doador"
            />
            {!isCompatible && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-gov-red/10 px-3 py-2.5 text-xs text-gov-red">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Essa coleta será marcada como cancelada e o doador não receberá pontos.</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
            <span className="text-xs font-semibold text-brand-700">
              {isCompatible ? "Pontos a confirmar" : "Pontos"}
            </span>
            <span className="text-sm font-bold text-brand-700">
              {isCompatible ? `+${actualPoints} pts` : "0 pts"}
            </span>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Confirmar coleta"}
          </Button>
        </form>
      </div>
    </main>
  );
}
