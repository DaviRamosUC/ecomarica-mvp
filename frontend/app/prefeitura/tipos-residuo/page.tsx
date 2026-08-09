"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { WasteTypeIcon } from "@/lib/wasteTypeIcons";
import { formatCurrency } from "@/lib/format";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { listarTiposResiduo, atualizarTipoResiduo } from "@/lib/api/tiposResiduo";
import { buscarTaxaConversao, atualizarTaxaConversao } from "@/lib/api/prefeitura";
import type { TipoResiduo } from "@/lib/api/types";

export default function TiposResiduoPage() {
  const { user, isLoading } = useRequireAuth("PREFEITURA");

  const [originalRows, setOriginalRows] = useState<TipoResiduo[]>([]);
  const [rows, setRows] = useState<{ id: string; nome: string; pointsPerKg: number }[]>([]);
  const [originalConversionRate, setOriginalConversionRate] = useState(100);
  const [conversionRate, setConversionRateInput] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listarTiposResiduo().then((tipos) => {
      setOriginalRows(tipos);
      setRows(
        tipos.map((t) => ({ id: t.id, nome: t.nome, pointsPerKg: Number(t.fatorPontuacaoPorKg) }))
      );
    });
    buscarTaxaConversao().then((taxa) => {
      const rate = Math.round(1 / Number(taxa.valorPorPonto));
      setOriginalConversionRate(rate);
      setConversionRateInput(rate);
    });
  }, [user]);

  if (isLoading || !user) return null;

  const isDirty =
    rows.some((row, index) => row.pointsPerKg !== Number(originalRows[index]?.fatorPontuacaoPorKg)) ||
    conversionRate !== originalConversionRate;

  const handlePointsChange = (id: string, value: string) => {
    const parsed = Number(value);
    setRows((prev) =>
      prev.map((row) => (row.id === id && Number.isFinite(parsed) ? { ...row, pointsPerKg: parsed } : row))
    );
    setJustSaved(false);
  };

  const handleConversionRateChange = (value: string) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) setConversionRateInput(parsed);
    setJustSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const dirtyRows = rows.filter(
        (row, index) => row.pointsPerKg !== Number(originalRows[index]?.fatorPontuacaoPorKg)
      );
      await Promise.all(dirtyRows.map((row) => atualizarTipoResiduo(row.id, row.pointsPerKg)));

      if (conversionRate !== originalConversionRate) {
        await atualizarTaxaConversao(1 / conversionRate);
      }

      const tipos = await listarTiposResiduo();
      setOriginalRows(tipos);
      setRows(tipos.map((t) => ({ id: t.id, nome: t.nome, pointsPerKg: Number(t.fatorPontuacaoPorKg) })));
      setOriginalConversionRate(conversionRate);
      setJustSaved(true);
    } catch {
      setSaveError("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-10 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy">Tipos de resíduo</h1>
          <p className="mt-1 text-sm text-gov-navy/55">
            Defina os fatores de pontuação por quilo e a taxa de conversão em moeda social.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          fullWidth={false}
          className="shrink-0 px-6"
        >
          {isSaving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>

      {saveError && (
        <div className="flex items-center gap-2 rounded-xl bg-gov-red/10 px-4 py-2.5 text-sm font-medium text-gov-red">
          {saveError}
        </div>
      )}

      {justSaved && !isDirty && (
        <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700">
          <Check className="h-4 w-4" />
          Alterações salvas com sucesso.
        </div>
      )}

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm shadow-gov-navy/5 ring-1 ring-gov-navy/5">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gov-navy/10 text-xs font-semibold uppercase tracking-wide text-gov-navy/40">
              <th className="px-6 py-3">Tipo de resíduo</th>
              <th className="px-6 py-3">Pontos por kg</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gov-navy/5 last:border-0">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <WasteTypeIcon nome={row.nome} className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-gov-navy">{row.nome}</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={row.pointsPerKg}
                      onChange={(e) => handlePointsChange(row.id, e.target.value)}
                      className="w-24 rounded-lg border border-gov-navy/15 px-3 py-1.5 text-sm text-gov-navy outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                    <span className="text-xs text-gov-navy/45">pts/kg</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm shadow-gov-navy/5 ring-1 ring-gov-navy/5">
        <h2 className="text-sm font-bold text-gov-navy">Taxa de conversão em moeda social</h2>
        <p className="mt-0.5 text-xs text-gov-navy/50">
          Quantos pontos equivalem a {formatCurrency(1)} em moeda social.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            min={1}
            step={1}
            value={conversionRate}
            onChange={(e) => handleConversionRateChange(e.target.value)}
            className="w-28 rounded-lg border border-gov-navy/15 px-3 py-1.5 text-sm text-gov-navy outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <span className="text-sm text-gov-navy/60">pontos = {formatCurrency(1)}</span>
        </div>
      </section>
    </div>
  );
}
