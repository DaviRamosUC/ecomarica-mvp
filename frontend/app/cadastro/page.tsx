"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Recycle, Truck } from "lucide-react";
import Logo from "@/components/Logo";
import GovBadge from "@/components/GovBadge";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import { MARICA_BAIRROS } from "@/lib/mocks/bairros";
import { useAuth, dashboardPathForPapel } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import { getCurrentPosition } from "@/lib/geolocation";
import { formatCep, buscarCep, matchBairro } from "@/lib/cep";

type Role = "DOADOR" | "COLETOR";

interface FormState {
  name: string;
  email: string;
  phone: string;
  zipCode: string;
  street: string;
  neighborhood: string;
  vehicle: string;
  coverageArea: string;
  password: string;
  confirmPassword: string;
}

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  zipCode: "",
  street: "",
  neighborhood: MARICA_BAIRROS[0],
  vehicle: "",
  coverageArea: MARICA_BAIRROS[0],
  password: "",
  confirmPassword: "",
};

function validate(form: FormState, role: Role, acceptedTerms: boolean) {
  const errors: Partial<Record<keyof FormState | "terms", string>> = {};

  if (!form.name.trim()) errors.name = "Informe seu nome completo";
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "Informe um e-mail válido";
  if (form.phone.replace(/\D/g, "").length < 10)
    errors.phone = "Informe um telefone válido com DDD";
  if (role === "DOADOR") {
    if (form.zipCode.replace(/\D/g, "").length !== 8) errors.zipCode = "CEP deve ter 8 dígitos";
    if (!form.street.trim()) errors.street = "Informe a rua e o número";
  } else {
    if (!form.vehicle.trim()) errors.vehicle = "Informe o veículo utilizado na coleta";
  }
  if (form.password.length < 6) errors.password = "A senha deve ter ao menos 6 caracteres";
  if (form.confirmPassword !== form.password)
    errors.confirmPassword = "As senhas não coincidem";
  if (!acceptedTerms) errors.terms = "É preciso aceitar os termos para continuar";

  return errors;
}

const roleCard = (active: boolean) =>
  `flex flex-1 flex-col items-center gap-1.5 rounded-2xl border-2 px-4 py-4 text-center transition-colors ${
    active
      ? "border-brand-500 bg-brand-50 text-brand-700"
      : "border-gov-navy/10 bg-white text-gov-navy/50 hover:border-gov-navy/20"
  }`;

export default function CadastroPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [role, setRole] = useState<Role>("DOADOR");
  const [form, setForm] = useState<FormState>(initialForm);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "terms", string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cepNotice, setCepNotice] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCepChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setForm((prev) => ({ ...prev, zipCode: formatted }));
    setCepNotice(null);

    if (formatted.replace(/\D/g, "").length !== 8) return;
    setCepNotice("Buscando endereço...");
    buscarCep(formatted).then((resultado) => {
      if (!resultado) {
        setCepNotice("CEP não encontrado. Preencha o endereço manualmente.");
        return;
      }
      const bairroEncontrado = matchBairro(resultado.bairro);
      setForm((prev) => ({
        ...prev,
        street: resultado.rua || prev.street,
        neighborhood: bairroEncontrado ?? prev.neighborhood,
      }));
      setCepNotice(null);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const validationErrors = validate(form, role, acceptedTerms);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const enderecoInicial =
        role === "DOADOR" ? await getCurrentPosition() : null;
      const usuario = await register({
        nome: form.name,
        email: form.email,
        telefone: form.phone,
        senha: form.password,
        papel: role,
        ...(role === "DOADOR"
          ? {
              endereco: `${form.street}, CEP ${form.zipCode}`,
              bairro: form.neighborhood,
              latitude: enderecoInicial!.latitude,
              longitude: enderecoInicial!.longitude,
            }
          : { veiculo: form.vehicle, areaAtuacao: form.coverageArea }),
      });
      router.push(dashboardPathForPapel(usuario.papel));
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Não foi possível criar a conta. Tente novamente."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-gov-bg px-6 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Logo size="md" withWordmark={false} />
          <div className="text-center">
            <h1 className="text-xl font-bold text-gov-navy">Criar conta</h1>
            <p className="mt-1 text-sm text-gov-navy/55">
              Junte-se ao programa de coleta seletiva de Maricá
            </p>
          </div>
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
              Eu quero
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("DOADOR")}
                className={roleCard(role === "DOADOR")}
              >
                <Recycle
                  className={`h-6 w-6 ${role === "DOADOR" ? "text-brand-600" : "text-gov-navy/35"}`}
                />
                <span className="text-sm font-semibold">Doar resíduos</span>
                <span className="text-[11px] text-current/70">Sinalizar coletas</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("COLETOR")}
                className={roleCard(role === "COLETOR")}
              >
                <Truck
                  className={`h-6 w-6 ${role === "COLETOR" ? "text-brand-600" : "text-gov-navy/35"}`}
                />
                <span className="text-sm font-semibold">Coletar</span>
                <span className="text-[11px] text-current/70">Atender rotas</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-gov-navy/40">
              Dados pessoais
            </span>
            <TextField
              label="Nome completo"
              name="name"
              placeholder="Seu nome"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            <TextField
              label="E-mail"
              type="email"
              name="email"
              placeholder="nome@email.com"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <TextField
              label="Telefone / WhatsApp"
              type="tel"
              name="phone"
              placeholder="(21) 99999-9999"
              autoComplete="tel"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
              required
            />
          </div>

          {role === "DOADOR" ? (
            <div className="flex flex-col gap-4 border-t border-gov-navy/10 pt-5">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-gov-navy/40">
                Endereço
              </span>
              <div>
                <TextField
                  label="CEP"
                  name="zipCode"
                  inputMode="numeric"
                  placeholder="00000-000"
                  value={form.zipCode}
                  onChange={handleCepChange}
                  error={errors.zipCode}
                  required
                />
                {cepNotice && (
                  <p className="mt-1.5 text-xs text-gov-navy/50">{cepNotice}</p>
                )}
              </div>
              <TextField
                label="Rua e número"
                name="street"
                placeholder="Rua, número e complemento"
                autoComplete="street-address"
                value={form.street}
                onChange={handleChange}
                error={errors.street}
                required
              />
              <SelectField
                label="Bairro"
                name="neighborhood"
                options={MARICA_BAIRROS}
                value={form.neighborhood}
                onChange={handleChange}
              />
              <p className="-mt-1 text-xs text-gov-navy/45">Cidade: Maricá - RJ</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 border-t border-gov-navy/10 pt-5">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-gov-navy/40">
                Dados de coleta
              </span>
              <TextField
                label="Veículo"
                name="vehicle"
                placeholder="Ex: Caminhão de coleta, moto, van"
                value={form.vehicle}
                onChange={handleChange}
                error={errors.vehicle}
                required
              />
              <SelectField
                label="Área de atuação"
                name="coverageArea"
                options={MARICA_BAIRROS}
                value={form.coverageArea}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-gov-navy/10 pt-5">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-gov-navy/40">
              Senha
            </span>
            <TextField
              label="Senha"
              type="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <TextField
              label="Confirmar senha"
              type="password"
              name="confirmPassword"
              placeholder="Repita a senha"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
          </div>

          <div className="border-t border-gov-navy/10 pt-5">
            <label className="flex items-start gap-2.5 text-xs text-gov-navy/70">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gov-navy/25 accent-brand-500"
              />
              <span>
                Li e aceito os{" "}
                <Link href="/termos" className="font-semibold text-brand-600 hover:underline">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link href="/privacidade" className="font-semibold text-brand-600 hover:underline">
                  Política de Privacidade
                </Link>
              </span>
            </label>
            {errors.terms && (
              <p className="mt-1.5 text-xs font-medium text-gov-red">{errors.terms}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gov-navy/60">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Entrar
          </Link>
        </p>

        <div className="pt-6">
          <GovBadge />
        </div>
      </div>
    </main>
  );
}
