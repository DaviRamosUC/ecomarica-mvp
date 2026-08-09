import { MARICA_BAIRROS } from "@/lib/mocks/bairros";

export interface CepResultado {
  rua: string;
  bairro: string;
}

export function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length <= 5 ? digits : `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

// O select de bairro usa a lista fixa de bairros de Marica; o ViaCEP retorna
// o nome livre, entao tentamos casar (sem acento/caixa) antes de preencher.
export function matchBairro(bairro: string): string | null {
  const normalize = (value: string) =>
    value.normalize("NFD").replace(DIACRITICS_REGEX, "").toLowerCase().trim();
  const target = normalize(bairro);
  return MARICA_BAIRROS.find((candidate) => normalize(candidate) === target) ?? null;
}

export async function buscarCep(cep: string): Promise<CepResultado | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.erro) return null;
    return { rua: data.logradouro ?? "", bairro: data.bairro ?? "" };
  } catch {
    return null;
  }
}
