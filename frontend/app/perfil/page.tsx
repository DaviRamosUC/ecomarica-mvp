"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Mail, Phone, MapPin, Pencil, Plus, Trash2, Truck, Coins, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import Toggle from "@/components/ui/Toggle";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import {
  listarEnderecos,
  criarEndereco,
  atualizarEndereco,
  removerEndereco,
} from "@/lib/api/enderecos";
import type { Endereco } from "@/lib/api/types";
import { ApiError } from "@/lib/api/client";
import { getCurrentPosition } from "@/lib/geolocation";
import { MARICA_BAIRROS } from "@/lib/mocks/bairros";
import { formatCep, buscarCep, matchBairro } from "@/lib/cep";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface AddressForm {
  apelido: string;
  cep: string;
  rua: string;
  bairro: string;
}

const emptyAddressForm: AddressForm = {
  apelido: "",
  cep: "",
  rua: "",
  bairro: MARICA_BAIRROS[0],
};

export default function PerfilPage() {
  const { user, isLoading } = useRequireAuth();
  const { logout } = useAuth();
  const router = useRouter();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const [enderecos, setEnderecos] = useState<Endereco[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AddressForm>(emptyAddressForm);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newForm, setNewForm] = useState<AddressForm>(emptyAddressForm);
  const [isSaving, setIsSaving] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [editCepNotice, setEditCepNotice] = useState<string | null>(null);
  const [newCepNotice, setNewCepNotice] = useState<string | null>(null);

  const role: "doador" | "coletor" = user?.papel === "COLETOR" ? "coletor" : "doador";

  useEffect(() => {
    if (!user || role !== "doador") return;
    listarEnderecos()
      .then(setEnderecos)
      .catch(() => setEnderecos([]));
  }, [user, role]);

  if (isLoading || !user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const startEdit = (endereco: Endereco) => {
    setEditingId(endereco.id);
    setEditForm({
      apelido: endereco.apelido ?? "",
      cep: "",
      rua: endereco.rua,
      bairro: endereco.bairro,
    });
    setAddressError(null);
    setEditCepNotice(null);
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditCepChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setEditForm((prev) => ({ ...prev, cep: formatted }));
    setEditCepNotice(null);

    if (formatted.replace(/\D/g, "").length !== 8) return;
    setEditCepNotice("Buscando endereço...");
    buscarCep(formatted).then((resultado) => {
      if (!resultado) {
        setEditCepNotice("CEP não encontrado. Preencha o endereço manualmente.");
        return;
      }
      const bairroEncontrado = matchBairro(resultado.bairro);
      setEditForm((prev) => ({
        ...prev,
        rua: resultado.rua || prev.rua,
        bairro: bairroEncontrado ?? prev.bairro,
      }));
      setEditCepNotice(null);
    });
  };

  const handleSaveEdit = async (id: string) => {
    setAddressError(null);
    if (!editForm.rua.trim()) {
      setAddressError("Informe a rua e o número");
      return;
    }
    setIsSaving(true);
    try {
      const atualizado = await atualizarEndereco(id, {
        apelido: editForm.apelido.trim() || undefined,
        rua: editForm.rua,
        bairro: editForm.bairro,
      });
      setEnderecos((prev) => prev?.map((e) => (e.id === id ? atualizado : e)) ?? prev);
      setEditingId(null);
    } catch (err) {
      setAddressError(
        err instanceof ApiError ? err.message : "Não foi possível salvar. Tente novamente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    setAddressError(null);
    try {
      await removerEndereco(id);
      setEnderecos((prev) => prev?.filter((e) => e.id !== id) ?? prev);
    } catch (err) {
      setAddressError(
        err instanceof ApiError ? err.message : "Não foi possível remover este endereço."
      );
    }
  };

  const handleNewChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewCepChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setNewForm((prev) => ({ ...prev, cep: formatted }));
    setNewCepNotice(null);

    if (formatted.replace(/\D/g, "").length !== 8) return;
    setNewCepNotice("Buscando endereço...");
    buscarCep(formatted).then((resultado) => {
      if (!resultado) {
        setNewCepNotice("CEP não encontrado. Preencha o endereço manualmente.");
        return;
      }
      const bairroEncontrado = matchBairro(resultado.bairro);
      setNewForm((prev) => ({
        ...prev,
        rua: resultado.rua || prev.rua,
        bairro: bairroEncontrado ?? prev.bairro,
      }));
      setNewCepNotice(null);
    });
  };

  const handleSaveNew = async () => {
    setAddressError(null);
    if (!newForm.rua.trim()) {
      setAddressError("Informe a rua e o número");
      return;
    }
    setIsSaving(true);
    try {
      const { latitude, longitude } = await getCurrentPosition();
      const criado = await criarEndereco({
        apelido: newForm.apelido.trim() || undefined,
        rua: newForm.rua,
        bairro: newForm.bairro,
        latitude,
        longitude,
      });
      setEnderecos((prev) => [...(prev ?? []), criado]);
      setNewForm(emptyAddressForm);
      setShowNewForm(false);
      setNewCepNotice(null);
    } catch (err) {
      setAddressError(
        err instanceof ApiError ? err.message : "Não foi possível salvar o endereço."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gov-bg pb-24">
      <header className="px-6 pt-8 pb-4">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-lg font-bold text-gov-navy">Perfil</h1>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6">
        <Card className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-xl font-bold text-white">
            {getInitials(user.nome)}
          </span>
          <div>
            <p className="text-base font-bold text-gov-navy">{user.nome}</p>
            <span className="mt-1 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">
              {role === "doador" ? "Doador" : "Coletor"}
            </span>
          </div>

          <div className="mt-2 flex w-full flex-col gap-2 border-t border-gov-navy/10 pt-4 text-left text-sm">
            <div className="flex items-center gap-2.5 text-gov-navy/70">
              <Mail className="h-4 w-4 shrink-0 text-gov-navy/40" />
              {user.email}
            </div>
            <div className="flex items-center gap-2.5 text-gov-navy/70">
              <Phone className="h-4 w-4 shrink-0 text-gov-navy/40" />
              {user.telefone}
            </div>
          </div>
        </Card>

        {role === "doador" ? (
          <>
            <Card className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-gov-navy/40">
                  Saldo de pontos
                </span>
                <Coins className="h-4 w-4 text-brand-600" />
              </div>
              <p className="text-2xl font-bold text-gov-navy">
                {(user.doador?.saldoPontos ?? 0).toLocaleString("pt-BR")} pts
              </p>
            </Card>

            <Card className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gov-navy/40">
                Meus endereços
              </span>

              {addressError && (
                <p className="text-xs font-medium text-gov-red">{addressError}</p>
              )}

              {enderecos === null ? (
                <p className="text-sm text-gov-navy/55">Carregando...</p>
              ) : enderecos.length === 0 ? (
                <p className="text-sm text-gov-navy/55">Nenhum endereço cadastrado.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {enderecos.map((endereco) =>
                    editingId === endereco.id ? (
                      <div
                        key={endereco.id}
                        className="flex flex-col gap-3 rounded-xl border border-gov-navy/10 p-3"
                      >
                        <TextField
                          label="Apelido (opcional)"
                          name="apelido"
                          value={editForm.apelido}
                          onChange={handleEditChange}
                        />
                        <div>
                          <TextField
                            label="CEP (opcional)"
                            name="cep"
                            inputMode="numeric"
                            placeholder="00000-000"
                            value={editForm.cep}
                            onChange={handleEditCepChange}
                          />
                          {editCepNotice && (
                            <p className="mt-1.5 text-xs text-gov-navy/50">{editCepNotice}</p>
                          )}
                        </div>
                        <TextField
                          label="Rua e número"
                          name="rua"
                          value={editForm.rua}
                          onChange={handleEditChange}
                          required
                        />
                        <SelectField
                          label="Bairro"
                          name="bairro"
                          options={MARICA_BAIRROS}
                          value={editForm.bairro}
                          onChange={handleEditChange}
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            fullWidth={false}
                            className="flex-1"
                            onClick={() => {
                              setEditingId(null);
                              setEditCepNotice(null);
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            fullWidth={false}
                            className="flex-1"
                            disabled={isSaving}
                            onClick={() => handleSaveEdit(endereco.id)}
                          >
                            {isSaving ? "Salvando..." : "Salvar"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={endereco.id}
                        className="flex items-start gap-2.5 rounded-xl border border-gov-navy/10 p-3"
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gov-navy/40" />
                        <div className="min-w-0 flex-1 text-sm">
                          {endereco.apelido && (
                            <p className="font-bold text-gov-navy">{endereco.apelido}</p>
                          )}
                          <p className="text-gov-navy/70">
                            {endereco.rua}, {endereco.bairro}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label="Editar endereço"
                          onClick={() => startEdit(endereco)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gov-navy/40 hover:bg-gov-bg hover:text-gov-navy"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Remover endereço"
                          onClick={() => handleRemove(endereco.id)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gov-navy/40 hover:bg-gov-red/10 hover:text-gov-red"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

              {showNewForm ? (
                <div className="flex flex-col gap-3 rounded-xl border border-gov-navy/10 p-3">
                  <TextField
                    label="Apelido (opcional)"
                    name="apelido"
                    placeholder="Ex: Casa, Trabalho"
                    value={newForm.apelido}
                    onChange={handleNewChange}
                  />
                  <div>
                    <TextField
                      label="CEP (opcional)"
                      name="cep"
                      inputMode="numeric"
                      placeholder="00000-000"
                      value={newForm.cep}
                      onChange={handleNewCepChange}
                    />
                    {newCepNotice && (
                      <p className="mt-1.5 text-xs text-gov-navy/50">{newCepNotice}</p>
                    )}
                  </div>
                  <TextField
                    label="Rua e número"
                    name="rua"
                    placeholder="Rua, número e complemento"
                    value={newForm.rua}
                    onChange={handleNewChange}
                    required
                  />
                  <SelectField
                    label="Bairro"
                    name="bairro"
                    options={MARICA_BAIRROS}
                    value={newForm.bairro}
                    onChange={handleNewChange}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      fullWidth={false}
                      className="flex-1"
                      onClick={() => {
                        setShowNewForm(false);
                        setAddressError(null);
                        setNewCepNotice(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      fullWidth={false}
                      className="flex-1"
                      disabled={isSaving}
                      onClick={handleSaveNew}
                    >
                      {isSaving ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button type="button" variant="secondary" onClick={() => setShowNewForm(true)}>
                  <Plus className="h-4 w-4" />
                  Adicionar endereço
                </Button>
              )}
            </Card>
          </>
        ) : (
          <Card className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gov-navy/40">
              Dados de coleta
            </span>
            <div className="flex items-center gap-2.5 text-sm text-gov-navy/70">
              <Truck className="h-4 w-4 shrink-0 text-gov-navy/40" />
              {user.coletor?.veiculo}
            </div>
            <div className="flex items-center gap-2.5 border-t border-gov-navy/10 pt-3 text-sm text-gov-navy/70">
              <MapPin className="h-4 w-4 shrink-0 text-gov-navy/40" />
              Área de atuação: {user.coletor?.areaAtuacao}
            </div>
          </Card>
        )}

        <Card className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-gov-navy/40">
            Notificações
          </span>
          <Toggle
            checked={pushEnabled}
            onChange={setPushEnabled}
            label="Notificações push"
            description="Avisos sobre coletas e pontos"
          />
          <Toggle
            checked={emailEnabled}
            onChange={setEmailEnabled}
            label="Resumo por e-mail"
            description="Receber um resumo mensal por e-mail"
          />
        </Card>

        <Button type="button" onClick={handleLogout} variant="secondary">
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>

      <BottomNav role={role} />
    </main>
  );
}
