-- AlterTable
ALTER TABLE "doadores" ADD COLUMN     "bairro" TEXT;

-- CreateTable
CREATE TABLE "taxa_conversao" (
    "id" UUID NOT NULL,
    "valorPorPonto" DECIMAL(10,4) NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxa_conversao_pkey" PRIMARY KEY ("id")
);
