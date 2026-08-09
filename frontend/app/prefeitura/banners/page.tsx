"use client";

import { useEffect, useRef, useState, ChangeEvent } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import Toggle from "@/components/ui/Toggle";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import {
  listarBannersAdmin,
  criarBanner,
  atualizarBanner,
  removerBanner,
} from "@/lib/api/banners";
import type { Banner } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import { fileToDataUrl } from "@/lib/fileToDataUrl";

export default function BannersPage() {
  const { user, isLoading } = useRequireAuth("PREFEITURA");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaImagem, setNovaImagem] = useState<{ file: File; preview: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listarBannersAdmin()
      .then(setBanners)
      .catch(() => setBanners([]));
  }, [user]);

  if (isLoading || !user) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNovaImagem({ file, preview: URL.createObjectURL(file) });
  };

  const handleAdd = async () => {
    setActionError(null);
    if (!novaImagem) {
      setActionError("Selecione uma imagem para o banner");
      return;
    }
    setIsSaving(true);
    try {
      const imagemUrl = await fileToDataUrl(novaImagem.file);
      const criado = await criarBanner({
        imagemUrl,
        titulo: novoTitulo.trim() || undefined,
      });
      setBanners((prev) => [...(prev ?? []), criado]);
      setNovoTitulo("");
      setNovaImagem(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Não foi possível salvar o banner."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAtivo = async (banner: Banner) => {
    setActionError(null);
    setBusyId(banner.id);
    try {
      const atualizado = await atualizarBanner(banner.id, { ativo: !banner.ativo });
      setBanners((prev) => prev?.map((b) => (b.id === atualizado.id ? atualizado : b)) ?? prev);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Não foi possível atualizar.");
    } finally {
      setBusyId(null);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    if (!banners) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const current = banners[index];
    const target = banners[targetIndex];
    setActionError(null);
    setBusyId(current.id);
    try {
      const [atualizadoCurrent, atualizadoTarget] = await Promise.all([
        atualizarBanner(current.id, { ordem: target.ordem }),
        atualizarBanner(target.id, { ordem: current.ordem }),
      ]);
      setBanners((prev) => {
        if (!prev) return prev;
        const next = [...prev];
        next[index] = atualizadoTarget;
        next[targetIndex] = atualizadoCurrent;
        return next;
      });
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Não foi possível reordenar.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (id: string) => {
    setActionError(null);
    setBusyId(id);
    try {
      await removerBanner(id);
      setBanners((prev) => prev?.filter((b) => b.id !== id) ?? prev);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Não foi possível remover.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-10 py-10">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">Banners</h1>
        <p className="mt-1 text-sm text-gov-navy/55">
          Gerencie as imagens do carrossel exibido no início do app dos doadores.
        </p>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-xl bg-gov-red/10 px-4 py-2.5 text-sm font-medium text-gov-red">
          {actionError}
        </div>
      )}

      <section className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm shadow-gov-navy/5 ring-1 ring-gov-navy/5">
        <h2 className="text-sm font-bold text-gov-navy">Adicionar banner</h2>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {novaImagem ? (
          <div className="relative w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={novaImagem.preview}
              alt="Prévia do banner"
              className="h-32 w-56 rounded-xl object-cover ring-1 ring-gov-navy/10"
            />
            <button
              type="button"
              onClick={() => {
                setNovaImagem(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gov-navy text-white"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-56 flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-gov-navy/15 py-8 text-gov-navy/45 hover:border-gov-navy/25"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-xs font-semibold">Selecionar imagem</span>
          </button>
        )}

        <div className="max-w-sm">
          <TextField
            label="Título (opcional)"
            placeholder="Ex: Campanha de reciclagem"
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
          />
        </div>

        <Button
          type="button"
          fullWidth={false}
          className="self-start px-6"
          disabled={isSaving}
          onClick={handleAdd}
        >
          {isSaving ? "Salvando..." : "Adicionar banner"}
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gov-navy/40">
          Banners cadastrados
        </h2>

        {banners === null ? (
          <p className="text-sm text-gov-navy/55">Carregando...</p>
        ) : banners.length === 0 ? (
          <p className="text-sm text-gov-navy/55">Nenhum banner cadastrado ainda.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm shadow-gov-navy/5 ring-1 ring-gov-navy/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.imagemUrl}
                  alt={banner.titulo ?? "Banner"}
                  className="h-16 w-28 shrink-0 rounded-xl object-cover ring-1 ring-gov-navy/10"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gov-navy">
                    {banner.titulo || "Sem título"}
                  </p>
                  <p className="text-xs text-gov-navy/45">Ordem {banner.ordem}</p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <button
                    type="button"
                    aria-label="Mover para cima"
                    disabled={index === 0 || busyId !== null}
                    onClick={() => handleMove(index, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-gov-navy/40 hover:bg-gov-bg hover:text-gov-navy disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Mover para baixo"
                    disabled={index === banners.length - 1 || busyId !== null}
                    onClick={() => handleMove(index, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-gov-navy/40 hover:bg-gov-bg hover:text-gov-navy disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="shrink-0">
                  <Toggle
                    checked={banner.ativo}
                    onChange={() => handleToggleAtivo(banner)}
                    label="Ativo"
                  />
                </div>

                <button
                  type="button"
                  aria-label="Remover banner"
                  disabled={busyId !== null}
                  onClick={() => handleRemove(banner.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gov-navy/40 hover:bg-gov-red/10 hover:text-gov-red disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
