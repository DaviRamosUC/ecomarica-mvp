import { Newspaper, Package, GlassWater, Cog, Cpu, Droplet, type LucideIcon } from "lucide-react";

const NAME_ICON_RULES: [pattern: string, icon: LucideIcon][] = [
  ["papel", Newspaper],
  ["plástico", Package],
  ["plastico", Package],
  ["vidro", GlassWater],
  ["metal", Cog],
  ["eletrôn", Cpu],
  ["eletron", Cpu],
  ["óleo", Droplet],
  ["oleo", Droplet],
];

// O back-end identifica tipos de resíduo pelo nome (texto livre, editável
// pela Prefeitura), não por um id fixo como no mock original — por isso o
// ícone é resolvido por correspondência parcial do nome, com um ícone
// genérico de fallback para tipos criados depois (ex: "Isopor").
export function getWasteTypeIcon(nome: string): LucideIcon {
  const normalized = nome.toLowerCase();
  const match = NAME_ICON_RULES.find(([pattern]) => normalized.includes(pattern));
  return match ? match[1] : Package;
}

// Resolve e desenha o ícone de um tipo de resíduo pelo nome usando tags
// JSX estáticas (nunca uma variável de componente resolvida em tempo de
// execução), para que o React Compiler não trate o ícone como "componente
// criado durante a renderização" fora de um `.map()`.
export function WasteTypeIcon({ nome, className }: { nome: string; className?: string }) {
  const normalized = nome.toLowerCase();
  if (normalized.includes("papel")) return <Newspaper className={className} />;
  if (normalized.includes("plástico") || normalized.includes("plastico"))
    return <Package className={className} />;
  if (normalized.includes("vidro")) return <GlassWater className={className} />;
  if (normalized.includes("metal")) return <Cog className={className} />;
  if (normalized.includes("eletrôn") || normalized.includes("eletron"))
    return <Cpu className={className} />;
  if (normalized.includes("óleo") || normalized.includes("oleo"))
    return <Droplet className={className} />;
  return <Package className={className} />;
}
