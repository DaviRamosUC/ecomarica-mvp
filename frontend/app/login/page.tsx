"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import GovBadge from "@/components/GovBadge";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { useAuth, dashboardPathForPapel } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const usuario = await login(email, password);
      router.push(dashboardPathForPapel(usuario.papel));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível entrar. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-gov-bg px-6 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-8 flex flex-col items-center gap-3">
            <Logo size="lg" withWordmark={false} />
            <div className="text-center">
              <h1 className="text-xl font-bold text-gov-navy">Bem-vindo de volta</h1>
              <p className="mt-1 text-sm text-gov-navy/55">
                Entre para continuar reciclando e ganhando pontos
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm shadow-gov-navy/5 ring-1 ring-gov-navy/5"
          >
            {error && (
              <p className="rounded-xl bg-gov-red/10 px-3.5 py-2.5 text-xs font-medium text-gov-red">
                {error}
              </p>
            )}
            <TextField
              label="E-mail"
              type="email"
              name="email"
              placeholder="nome@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div>
              <TextField
                label="Senha"
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="mt-2 text-right">
                <Link
                  href="/esqueci-senha"
                  className="text-xs font-semibold text-gov-blue hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
            </div>

            <Button type="submit" className="mt-1" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-gov-navy/10" />
              <span className="text-[11px] font-medium uppercase tracking-wide text-gov-navy/35">
                ou
              </span>
              <div className="h-px flex-1 bg-gov-navy/10" />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="text-xs">
                Google
              </Button>
              <Button type="button" variant="secondary" className="text-xs">
                <span className="text-gov-blue">gov.br</span>
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gov-navy/60">
            Não tem conta?{" "}
            <Link href="/cadastro" className="font-semibold text-brand-600 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>

        <div className="pt-6">
          <GovBadge />
        </div>
      </div>
    </main>
  );
}
