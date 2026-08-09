"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Image, LayoutDashboard, LogOut, Recycle, Truck } from "lucide-react";
import Logo from "@/components/Logo";
import GovBadge from "@/components/GovBadge";
import { useAuth } from "@/lib/auth/AuthContext";

const items = [
  { href: "/prefeitura/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/prefeitura/tipos-residuo", label: "Tipos de resíduo", icon: Recycle },
  { href: "/prefeitura/coletores", label: "Coletores", icon: Truck },
  { href: "/prefeitura/banners", label: "Banners", icon: Image },
];

export default function PrefeituraSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-gov-navy/10 bg-white px-4 py-6">
      <div className="px-2">
        <Logo size="sm" />
        <p className="mt-1 text-xs font-semibold text-gov-navy/45">Painel da Prefeitura</p>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-brand-50 text-brand-700" : "text-gov-navy/60 hover:bg-gov-bg"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 px-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-gov-navy/60 transition-colors hover:bg-gov-bg"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
        <GovBadge />
      </div>
    </aside>
  );
}
