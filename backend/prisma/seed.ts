import { Papel, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const tiposResiduo = [
  { nome: 'Papel e papelão', fatorPontuacaoPorKg: 2 },
  { nome: 'Plástico', fatorPontuacaoPorKg: 3 },
  { nome: 'Vidro', fatorPontuacaoPorKg: 1.5 },
  { nome: 'Metal', fatorPontuacaoPorKg: 4 },
  { nome: 'Eletrônico', fatorPontuacaoPorKg: 10 },
  { nome: 'Óleo de cozinha', fatorPontuacaoPorKg: 5 },
];

const TAXA_CONVERSAO_INICIAL = 0.01;

async function main() {
  for (const tipo of tiposResiduo) {
    await prisma.tipoResiduo.upsert({
      where: { nome: tipo.nome },
      update: {},
      create: tipo,
    });
  }

  const taxaExistente = await prisma.taxaConversao.findFirst();
  if (!taxaExistente) {
    await prisma.taxaConversao.create({
      data: { valorPorPonto: TAXA_CONVERSAO_INICIAL },
    });
  }

  // Não há registro público para o papel PREFEITURA (módulo 2 só permite
  // DOADOR/COLETOR via /auth/register), então este usuário de bootstrap é
  // criado aqui, igual à TipoResiduo, para permitir testar o módulo 8.
  const senhaHash = await bcrypt.hash('prefeitura123', 10);
  await prisma.usuario.upsert({
    where: { email: 'prefeitura@marica.rj.gov.br' },
    update: {},
    create: {
      nome: 'Agente Prefeitura Maricá',
      email: 'prefeitura@marica.rj.gov.br',
      senhaHash,
      telefone: '2199999999',
      papel: Papel.PREFEITURA,
      agentePrefeitura: {
        create: {
          departamento: 'Meio Ambiente',
          permissoes: ['GESTAO_RESIDUOS', 'HOMOLOGACAO_COLETORES'],
        },
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
