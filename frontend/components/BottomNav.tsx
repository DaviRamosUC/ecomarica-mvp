"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Coins, Bell, User, Route } from "lucide-react";

type Role = "doador" | "coletor";

const itemsByRole: Record<Role, { href: string; label: string; icon: typeof Home }[]> = {
  doador: [
    { href: "/doador/dashboard", label: "Início", icon: Home },
    { href: "/doador/pontos", label: "Pontos", icon: Coins },
    { href: "/notificacoes", label: "Avisos", icon: Bell },
    { href: "/perfil", label: "Perfil", icon: User },
  ],
  coletor: [
    { href: "/coletor/dashboard", label: "Início", icon: Home },
    { href: "/coletor/rota", label: "Rota", icon: Route },
    { href: "/notificacoes", label: "Avisos", icon: Bell },
    { href: "/perfil", label: "Perfil", icon: User },
  ],
};

export default function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = itemsByRole[role];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-gov-navy/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-sm items-center justify-between px-6 py-2.5">
        {items.map(({ href, label, icon: Icon }) => {
          const hrefPath = href.split("?")[0];
          const active = pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${
                active ? "text-brand-600" : "text-gov-navy/40"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
