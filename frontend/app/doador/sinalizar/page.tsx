"use client";

import { useEffect, useMemo, useRef, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ImagePlus, MapPin, Minus, Plus, X } from "lucide-react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import { getWasteTypeIcon } from "@/lib/wasteTypeIcons";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { listarTiposResiduo } from "@/lib/api/tiposResiduo";
import { criarColeta } from "@/lib/api/coletas";
import { listarEnderecos, criarEndereco } from "@/lib/api/enderecos";
import type { Endereco, TipoResiduo } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import { getCurrentPosition } from "@/lib/geolocation";
import { fileToDataUrl } from "@/lib/fileToDataUrl";
import { cacheCollection } from "@/lib/collectionCache";
import { MARICA_BAIRROS } from "@/lib/mocks/bairros";
import { formatCep, buscarCep, matchBairro } from "@/lib/cep";

const MIN_WEIGHT = 0.5;
const MAX_WEIGHT = 50;
const WEIGHT_STEP = 0.5;

const wasteCard = (active: boolean) =>
  `flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-3 text-center transition-colors ${
    active
      ? "border-brand-500 bg-brand-50 text-brand-700"
      : "border-gov-navy/10 bg-white text-gov-navy/55 hover:border-gov-navy/20"
  }`;

const addressCard = (active: boolean) =>
  `flex w-full items-start gap-2.5 rounded-2xl border-2 px-3.5 py-3 text-left transition-colors ${
    active
      ? "border-brand-500 bg-brand-50 text-brand-700"
      : "border-gov-navy/10 bg-white text-gov-navy/70 hover:border-gov-navy/20"
  }`;

interface NewAddressForm {
  apelido: string;
  cep: string;
  rua: string;
  bairro: string;
}

const initialNewAddressForm: NewAddressForm = {
  apelido: "",
  cep: "",
  rua: "",
  bairro: MARICA_BAIRROS[0],
};

export default function SinalizarColetaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoading } = useRequireAuth("DOADOR");

  const [wasteTypes, setWasteTypes] = useState<TipoResiduo[]>([]);
  const [wasteTypeId, setWasteTypeId] = useState<string | null>(null);
  const [weightKg, setWeightKg] = useState(2);

  const [enderecos, setEnderecos] = useState<Endereco[] | null>(null);
  const [enderecoId, setEnderecoId] = useState<string | null>(null);
  const [enderecoIdSeededFor, setEnderecoIdSeededFor] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState<NewAddressForm>(initialNewAddressForm);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [cepNotice, setCepNotice] = useState<string | null>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ wasteType?: string; endereco?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listarTiposResiduo().then((tipos) => setWasteTypes(tipos.filter((t) => t.ativo)));
  }, []);

  useEffect(() => {
    if (!user) return;
    listarEnderecos()
      .then(setEnderecos)
      .catch(() => setEnderecos([]));
  }, [user]);

  // Seleciona o primeiro endereço cadastrado por padrão, assim que a lista
  // carrega — feito durante a renderização (padrão React recomendado para
  // "ajustar estado com base em props") em vez de useEffect.
  if (enderecos && enderecos.length > 0 && enderecoIdSeededFor !== enderecos[0].id) {
    setEnderecoIdSeededFor(enderecos[0].id);
    setEnderecoId(enderecos[0].id);
  }

  const photoPreview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const selectedWasteType = wasteTypeId ? wasteTypes.find((t) => t.id === wasteTypeId) : null;
  const estimatedPoints = selectedWasteType
    ? Math.round(Number(selectedWasteType.fatorPontuacaoPorKg) * weightKg * 10) / 10
    : 0;

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhoto(e.target.files?.[0] ?? null);
  };

  const handleNewAddressChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewAddressCepChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setNewAddressForm((prev) => ({ ...prev, cep: formatted }));
    setCepNotice(null);

    if (formatted.replace(/\D/g, "").length !== 8) return;
    setCepNotice("Buscando endereço...");
    buscarCep(formatted).then((resultado) => {
      if (!resultado) {
        setCepNotice("CEP não encontrado. Preencha o endereço manualmente.");
        return;
      }
      const bairroEncontrado = matchBairro(resultado.bairro);
      setNewAddressForm((prev) => ({
        ...prev,
        rua: resultado.rua || prev.rua,
        bairro: bairroEncontrado ?? prev.bairro,
      }));
      setCepNotice(null);
    });
  };

  const handleSaveNewAddress = async () => {
    setAddressError(null);
    if (!newAddressForm.rua.trim()) {
      setAddressError("Informe a rua e o número");
      return;
    }

    setIsSavingAddress(true);
    try {
      const { latitude, longitude } = await getCurrentPosition();
      const novoEndereco = await criarEndereco({
        apelido: newAddressForm.apelido.trim() || undefined,
        rua: newAddressForm.rua,
        bairro: newAddressForm.bairro,
        latitude,
        longitude,
      });
      setEnderecos((prev) => [...(prev ?? []), novoEndereco]);
      setEnderecoId(novoEndereco.id);
      setNewAddressForm(initialNewAddressForm);
      setShowNewAddressForm(false);
      setErrors((prev) => ({ ...prev, endereco: undefined }));
    } catch (err) {
      setAddressError(
        err instanceof ApiError ? err.message : "Não foi possível salvar o endereço. Tente novamente."
      );
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors: { wasteType?: string; endereco?: string } = {};
    if (!wasteTypeId) validationErrors.wasteType = "Selecione o tipo de resíduo";
    if (!enderecoId) validationErrors.endereco = "Selecione ou adicione um endereço";
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0 || !selectedWasteType || !enderecoId) return;

    setIsSubmitting(true);
    try {
      const fotoEvidenciaUrl = photo ? await fileToDataUrl(photo) : undefined;
      const collection = await criarColeta({
        tipoResiduoId: selectedWasteType.id,
        enderecoId,
        quantidadeEstimadaKg: weightKg,
        fotoEvidenciaUrl,
      });
      cacheCollection(collection);
      router.push(`/doador/sinalizar/confirmacao?id=${collection.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Não foi possível sinalizar a coleta. Tente novamente."
      );
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-lg font-bold text-gov-navy">Sinalizar coleta</h1>
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
          <div>
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gov-navy/40">
              Tipo de resíduo
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {wasteTypes.map((wasteType) => {
                const Icon = getWasteTypeIcon(wasteType.nome);
                const active = wasteTypeId === wasteType.id;
                return (
                  <button
                    key={wasteType.id}
                    type="button"
                    onClick={() => setWasteTypeId(wasteType.id)}
                    className={wasteCard(active)}
                  >
                    <Icon className={`h-5 w-5 ${active ? "text-brand-600" : "text-gov-navy/35"}`} />
                    <span className="text-xs font-semibold">{wasteType.nome}</span>
                  </button>
                );
              })}
            </div>
            {errors.wasteType && (
              <p className="mt-2 text-xs font-medium text-gov-red">{errors.wasteType}</p>
            )}
          </div>

          <div className="border-t border-gov-navy/10 pt-5">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gov-navy/40">
              Quantidade estimada
            </span>
            <div className="flex items-center justify-between rounded-2xl border border-gov-navy/15 px-4 py-3">
              <button
                type="button"
                onClick={() => setWeightKg((w) => Math.max(MIN_WEIGHT, Math.round((w - WEIGHT_STEP) * 10) / 10))}
                disabled={weightKg <= MIN_WEIGHT}
                aria-label="Diminuir quantidade"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gov-bg text-gov-navy disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-bold text-gov-navy">
                {weightKg.toLocaleString("pt-BR")} kg
              </span>
              <button
                type="button"
                onClick={() => setWeightKg((w) => Math.min(MAX_WEIGHT, Math.round((w + WEIGHT_STEP) * 10) / 10))}
                disabled={weightKg >= MAX_WEIGHT}
                aria-label="Aumentar quantidade"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gov-bg text-gov-navy disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="border-t border-gov-navy/10 pt-5">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gov-navy/40">
              Localização
            </span>

            {enderecos === null ? (
              <p className="text-sm text-gov-navy/55">Carregando endereços...</p>
            ) : (
              <div className="flex flex-col gap-2">
                {enderecos.map((endereco) => (
                  <button
                    key={endereco.id}
                    type="button"
                    onClick={() => {
                      setEnderecoId(endereco.id);
                      setErrors((prev) => ({ ...prev, endereco: undefined }));
                    }}
                    className={addressCard(enderecoId === endereco.id)}
                  >
                    <MapPin
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        enderecoId === endereco.id ? "text-brand-600" : "text-gov-navy/35"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      {endereco.apelido && (
                        <span className="block text-xs font-bold">{endereco.apelido}</span>
                      )}
                      <span className="block truncate text-sm font-medium">
                        {endereco.rua}, {endereco.bairro}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {errors.endereco && (
              <p className="mt-2 text-xs font-medium text-gov-red">{errors.endereco}</p>
            )}

            {showNewAddressForm ? (
              <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-gov-navy/10 p-3.5">
                {addressError && (
                  <p className="text-xs font-medium text-gov-red">{addressError}</p>
                )}
                <TextField
                  label="Apelido (opcional)"
                  name="apelido"
                  placeholder="Ex: Casa, Trabalho"
                  value={newAddressForm.apelido}
                  onChange={handleNewAddressChange}
                />
                <div>
                  <TextField
                    label="CEP (opcional)"
                    name="cep"
                    inputMode="numeric"
                    placeholder="00000-000"
                    value={newAddressForm.cep}
                    onChange={handleNewAddressCepChange}
                  />
                  {cepNotice && (
                    <p className="mt-1.5 text-xs text-gov-navy/50">{cepNotice}</p>
                  )}
                </div>
                <TextField
                  label="Rua e número"
                  name="rua"
                  placeholder="Rua, número e complemento"
                  value={newAddressForm.rua}
                  onChange={handleNewAddressChange}
                  required
                />
                <SelectField
                  label="Bairro"
                  name="bairro"
                  options={MARICA_BAIRROS}
                  value={newAddressForm.bairro}
                  onChange={handleNewAddressChange}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth={false}
                    className="flex-1"
                    onClick={() => {
                      setShowNewAddressForm(false);
                      setAddressError(null);
                      setCepNotice(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    fullWidth={false}
                    className="flex-1"
                    disabled={isSavingAddress}
                    onClick={handleSaveNewAddress}
                  >
                    {isSavingAddress ? "Salvando..." : "Salvar endereço"}
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewAddressForm(true)}
                className="mt-2 text-xs font-semibold text-brand-600 hover:underline"
              >
                + Adicionar novo endereço
              </button>
            )}
          </div>

          <div className="border-t border-gov-navy/10 pt-5">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gov-navy/40">
              Foto (opcional)
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
                  alt="Prévia da foto do resíduo"
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
                className="flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-gov-navy/15 py-6 text-gov-navy/45 hover:border-gov-navy/25"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-xs font-semibold">Adicionar foto</span>
              </button>
            )}
          </div>

          {selectedWasteType && (
            <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
              <span className="text-xs font-semibold text-brand-700">Pontos estimados</span>
              <span className="text-sm font-bold text-brand-700">+{estimatedPoints} pts</span>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Sinalizar coleta"}
          </Button>
        </form>
      </div>
    </main>
  );
}
