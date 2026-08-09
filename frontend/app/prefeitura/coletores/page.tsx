"use client";

import { useEffect, useState } from "react";
import StatusPill from "@/components/ui/StatusPill";
import Button from "@/components/ui/Button";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { listarColetores, homologarColetor } from "@/lib/api/coletores";
import type { Coletor } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";

export default function ColetoresPage() {
  const { user, isLoading } = useRequireAuth("PREFEITURA");
  const [coletores, setColetores] = useState<Coletor[] | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listarColetores()
      .then(setColetores)
      .catch(() => setColetores([]));
  }, [user]);

  if (isLoading || !user) return null;

  const handleToggle = async (coletor: Coletor) => {
    setActionError(null);
    setUpdatingId(coletor.usuarioId);
    try {
      const atualizado = await homologarColetor(coletor.usuarioId, !coletor.homologado);
      setColetores((prev) =>
        prev?.map((c) => (c.usuarioId === atualizado.usuarioId ? atualizado : c)) ?? prev
      );
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Não foi possível atualizar este coletor."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const pendentes = coletores?.filter((c) => !c.homologado) ?? [];
  const homologados = coletores?.filter((c) => c.homologado) ?? [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-10 py-10">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy">Coletores</h1>
        <p className="mt-1 text-sm text-gov-navy/55">
          Homologue coletores cadastrados para que possam aceitar coletas.
        </p>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-xl bg-gov-red/10 px-4 py-2.5 text-sm font-medium text-gov-red">
          {actionError}
        </div>
      )}

      {coletores === null ? (
        <p className="text-sm text-gov-navy/55">Carregando...</p>
      ) : coletores.length === 0 ? (
        <p className="text-sm text-gov-navy/55">Nenhum coletor cadastrado.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {pendentes.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gov-navy/40">
                Pendentes de homologação ({pendentes.length})
              </h2>
              <ColetoresTable
                coletores={pendentes}
                updatingId={updatingId}
                onToggle={handleToggle}
              />
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gov-navy/40">
              Homologados ({homologados.length})
            </h2>
            {homologados.length === 0 ? (
              <p className="text-sm text-gov-navy/55">Nenhum coletor homologado ainda.</p>
            ) : (
              <ColetoresTable
                coletores={homologados}
                updatingId={updatingId}
                onToggle={handleToggle}
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function ColetoresTable({
  coletores,
  updatingId,
  onToggle,
}: {
  coletores: Coletor[];
  updatingId: string | null;
  onToggle: (coletor: Coletor) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm shadow-gov-navy/5 ring-1 ring-gov-navy/5">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gov-navy/10 text-xs font-semibold uppercase tracking-wide text-gov-navy/40">
            <th className="px-6 py-3">Coletor</th>
            <th className="px-6 py-3">Veículo</th>
            <th className="px-6 py-3">Área de atuação</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody>
          {coletores.map((coletor) => (
            <tr key={coletor.usuarioId} className="border-b border-gov-navy/5 last:border-0">
              <td className="px-6 py-3">
                <p className="font-medium text-gov-navy">{coletor.usuario?.nome}</p>
                <p className="text-xs text-gov-navy/45">{coletor.usuario?.email}</p>
              </td>
              <td className="px-6 py-3 text-gov-navy/70">{coletor.veiculo}</td>
              <td className="px-6 py-3 text-gov-navy/70">{coletor.areaAtuacao}</td>
              <td className="px-6 py-3">
                <StatusPill
                  label={coletor.homologado ? "Homologado" : "Pendente"}
                  tone={coletor.homologado ? "success" : "warning"}
                />
              </td>
              <td className="px-6 py-3 text-right">
                <Button
                  type="button"
                  variant={coletor.homologado ? "secondary" : "primary"}
                  fullWidth={false}
                  className="px-4 py-1.5 text-xs"
                  disabled={updatingId === coletor.usuarioId}
                  onClick={() => onToggle(coletor)}
                >
                  {updatingId === coletor.usuarioId
                    ? "Salvando..."
                    : coletor.homologado
                      ? "Revogar"
                      : "Homologar"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
