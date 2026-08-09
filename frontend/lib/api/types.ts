export type Papel = "DOADOR" | "COLETOR" | "PREFEITURA";

export interface Endereco {
  id: string;
  doadorId: string;
  apelido: string | null;
  rua: string;
  bairro: string;
  latitude: number;
  longitude: number;
  criadoEm: string;
}

export interface Doador {
  usuarioId: string;
  saldoPontos: number;
  saldoMoedaSocial: string;
  enderecos?: Endereco[];
  usuario?: { nome: string; email: string; telefone: string; criadoEm: string };
}

export interface Coletor {
  usuarioId: string;
  veiculo: string;
  areaAtuacao: string;
  avaliacaoMedia: number;
  disponivel: boolean;
  homologado: boolean;
  usuario?: { nome: string; email: string; telefone: string; criadoEm: string };
}

export interface AgentePrefeitura {
  usuarioId: string;
  departamento: string;
  permissoes: string[];
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  papel: Papel;
  criadoEm: string;
  doador: Doador | null;
  coletor: Coletor | null;
  agentePrefeitura: AgentePrefeitura | null;
}

export interface AuthResponse {
  accessToken: string;
  usuario: Usuario;
}

export type StatusColeta = "AGUARDANDO" | "ACEITA" | "A_CAMINHO" | "CONFIRMADA" | "CANCELADA";

export interface TipoResiduo {
  id: string;
  nome: string;
  fatorPontuacaoPorKg: string;
  ativo: boolean;
}

export interface Coleta {
  id: string;
  doadorId: string;
  coletorId: string | null;
  tipoResiduoId: string;
  quantidadeEstimadaKg: string;
  quantidadeRealKg: string | null;
  status: StatusColeta;
  enderecoId: string;
  latitude: number;
  longitude: number;
  fotoEvidenciaUrl: string | null;
  dataSolicitacao: string;
  dataColeta: string | null;
  pontosGerados: number | null;
  tipoResiduo: TipoResiduo;
  endereco?: Endereco;
  doador?: {
    usuarioId: string;
    saldoPontos: number;
    saldoMoedaSocial: string;
    usuario: { nome: string; telefone: string };
  };
  distanciaMetros?: number;
}

export interface Rota {
  id: string;
  coletorId: string;
  data: string;
  status: "PLANEJADA" | "EM_ANDAMENTO" | "CONCLUIDA";
  coletaIds: string[];
  coletas: Coleta[];
}

export interface PontosTransacao {
  id: string;
  doadorId: string;
  coletaId: string;
  pontos: number;
  data: string;
  coleta: Coleta;
}

export interface Notificacao {
  id: string;
  usuarioId: string;
  mensagem: string;
  lida: boolean;
  data: string;
}

export interface TaxaConversao {
  id: string;
  valorPorPonto: string;
  atualizadoEm: string;
}

export interface Banner {
  id: string;
  imagemUrl: string;
  titulo: string | null;
  ordem: number;
  ativo: boolean;
  criadoEm: string;
}

export interface DashboardPrefeitura {
  totalColetas: number;
  totalPesoColetadoKg: number;
  totalPontosDistribuidos: number;
  doadoresAtivos: number;
  coletoresHomologados: number;
  totalMoedaSocialEmitida: number;
  impactoPorBairro: { bairro: string; pesoColetadoKg: number }[];
}
