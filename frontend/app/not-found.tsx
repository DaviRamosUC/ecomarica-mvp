import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gov-bg px-6 text-center">
      <h1 className="text-lg font-bold text-gov-navy">Página não encontrada</h1>
      <p className="text-sm text-gov-navy/55">O endereço acessado não existe.</p>
      <Link href="/" className="text-sm font-semibold text-brand-600 hover:underline">
        Voltar ao início
      </Link>
    </main>
  );
}
