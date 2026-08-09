-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('DOADOR', 'COLETOR', 'PREFEITURA');

-- CreateEnum
CREATE TYPE "StatusColeta" AS ENUM ('AGUARDANDO', 'ACEITA', 'A_CAMINHO', 'CONFIRMADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StatusRota" AS ENUM ('PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "StatusMoedaSocialTransacao" AS ENUM ('PROCESSANDO', 'CONCLUIDA', 'FALHOU');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "papel" "Papel" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doadores" (
    "usuarioId" UUID NOT NULL,
    "endereco" TEXT NOT NULL,
    "saldoPontos" INTEGER NOT NULL DEFAULT 0,
    "saldoMoedaSocial" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "doadores_pkey" PRIMARY KEY ("usuarioId")
);

-- CreateTable
CREATE TABLE "coletores" (
    "usuarioId" UUID NOT NULL,
    "veiculo" TEXT NOT NULL,
    "areaAtuacao" TEXT NOT NULL,
    "avaliacaoMedia" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "homologado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "coletores_pkey" PRIMARY KEY ("usuarioId")
);

-- CreateTable
CREATE TABLE "agentes_prefeitura" (
    "usuarioId" UUID NOT NULL,
    "departamento" TEXT NOT NULL,
    "permissoes" TEXT[],

    CONSTRAINT "agentes_prefeitura_pkey" PRIMARY KEY ("usuarioId")
);

-- CreateTable
CREATE TABLE "tipos_residuo" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "fatorPontuacaoPorKg" DECIMAL(10,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipos_residuo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coletas" (
    "id" UUID NOT NULL,
    "doadorId" UUID NOT NULL,
    "coletorId" UUID,
    "tipoResiduoId" UUID NOT NULL,
    "quantidadeEstimadaKg" DECIMAL(10,2) NOT NULL,
    "quantidadeRealKg" DECIMAL(10,2),
    "status" "StatusColeta" NOT NULL DEFAULT 'AGUARDANDO',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "fotoEvidenciaUrl" TEXT,
    "dataSolicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataColeta" TIMESTAMP(3),
    "pontosGerados" INTEGER,

    CONSTRAINT "coletas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rotas" (
    "id" UUID NOT NULL,
    "coletorId" UUID NOT NULL,
    "data" DATE NOT NULL,
    "status" "StatusRota" NOT NULL DEFAULT 'PLANEJADA',
    "coletaIds" UUID[],

    CONSTRAINT "rotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pontos_transacoes" (
    "id" UUID NOT NULL,
    "doadorId" UUID NOT NULL,
    "coletaId" UUID NOT NULL,
    "pontos" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pontos_transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moeda_social_transacoes" (
    "id" UUID NOT NULL,
    "doadorId" UUID NOT NULL,
    "pontosConvertidos" INTEGER NOT NULL,
    "valorMoeda" DECIMAL(10,2) NOT NULL,
    "status" "StatusMoedaSocialTransacao" NOT NULL DEFAULT 'PROCESSANDO',
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moeda_social_transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_residuo_nome_key" ON "tipos_residuo"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "pontos_transacoes_coletaId_key" ON "pontos_transacoes"("coletaId");

-- AddForeignKey
ALTER TABLE "doadores" ADD CONSTRAINT "doadores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coletores" ADD CONSTRAINT "coletores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agentes_prefeitura" ADD CONSTRAINT "agentes_prefeitura_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coletas" ADD CONSTRAINT "coletas_doadorId_fkey" FOREIGN KEY ("doadorId") REFERENCES "doadores"("usuarioId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coletas" ADD CONSTRAINT "coletas_coletorId_fkey" FOREIGN KEY ("coletorId") REFERENCES "coletores"("usuarioId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coletas" ADD CONSTRAINT "coletas_tipoResiduoId_fkey" FOREIGN KEY ("tipoResiduoId") REFERENCES "tipos_residuo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotas" ADD CONSTRAINT "rotas_coletorId_fkey" FOREIGN KEY ("coletorId") REFERENCES "coletores"("usuarioId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pontos_transacoes" ADD CONSTRAINT "pontos_transacoes_doadorId_fkey" FOREIGN KEY ("doadorId") REFERENCES "doadores"("usuarioId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pontos_transacoes" ADD CONSTRAINT "pontos_transacoes_coletaId_fkey" FOREIGN KEY ("coletaId") REFERENCES "coletas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moeda_social_transacoes" ADD CONSTRAINT "moeda_social_transacoes_doadorId_fkey" FOREIGN KEY ("doadorId") REFERENCES "doadores"("usuarioId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
