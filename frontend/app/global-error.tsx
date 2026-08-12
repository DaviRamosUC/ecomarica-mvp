"use client";

// global-error substitui todo o root layout quando um erro não tratado
// acontece nele — por isso precisa declarar <html>/<body> própria e não tem
// acesso ao globals.css (Tailwind), só estilos inline. Ver AGENTS.md: no
// Next.js 16 o boundary usa a prop `retry`, não mais `reset`.
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          padding: "24px",
          textAlign: "center",
          fontFamily:
            "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          backgroundColor: "#f4f6f9",
          color: "#1d2a44",
        }}
      >
        <h1 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
          Algo deu errado
        </h1>
        <p style={{ fontSize: "14px", color: "#1d2a4499", margin: 0 }}>
          Tente novamente em instantes.
        </p>
        <button
          onClick={() => retry()}
          style={{
            marginTop: "8px",
            padding: "10px 20px",
            borderRadius: "9999px",
            border: "none",
            backgroundColor: "#2e7d32",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
