"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Card from "@/components/ui/Card";
import BottomNav from "@/components/BottomNav";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { listarNotificacoes, marcarNotificacaoComoLida } from "@/lib/api/notificacoes";
import type { Notificacao } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";

export default function NotificacoesPage() {
  const { user, isLoading } = useRequireAuth();
  const [notifications, setNotifications] = useState<Notificacao[] | null>(null);

  useEffect(() => {
    if (!user) return;
    listarNotificacoes()
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, [user]);

  if (isLoading || !user) return null;

  const role: "doador" | "coletor" = user.papel === "COLETOR" ? "coletor" : "doador";

  const handleClick = (notification: Notificacao) => {
    if (notification.lida) return;
    setNotifications(
      (prev) => prev?.map((n) => (n.id === notification.id ? { ...n, lida: true } : n)) ?? prev
    );
    marcarNotificacaoComoLida(notification.id).catch(() => {
      setNotifications(
        (prev) => prev?.map((n) => (n.id === notification.id ? { ...n, lida: false } : n)) ?? prev
      );
    });
  };

  return (
    <main className="flex min-h-screen flex-col bg-gov-bg pb-24">
      <header className="px-6 pt-8 pb-4">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-lg font-bold text-gov-navy">Notificações</h1>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-3 px-6">
        {notifications === null ? (
          <Card className="text-center text-sm text-gov-navy/55">Carregando...</Card>
        ) : notifications.length === 0 ? (
          <Card className="text-center text-sm text-gov-navy/55">
            Nenhuma notificação por aqui.
          </Card>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => handleClick(notification)}
              className="text-left"
            >
              <Card className="flex flex-row items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    notification.lida
                      ? "bg-gov-navy/8 text-gov-navy/40"
                      : "bg-brand-50 text-brand-600"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {!notification.lida && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    )}
                    <p
                      className={`text-sm ${
                        notification.lida ? "font-medium text-gov-navy/70" : "font-bold text-gov-navy"
                      }`}
                    >
                      {notification.mensagem}
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] text-gov-navy/35">
                    {formatDateTime(notification.data)}
                  </p>
                </div>
              </Card>
            </button>
          ))
        )}
      </div>

      <BottomNav role={role} />
    </main>
  );
}
