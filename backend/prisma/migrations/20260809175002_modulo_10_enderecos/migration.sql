/*
  Warnings:

  - You are about to drop the column `endereco` on the `coletas` table. All the data in the column will be lost.
  - You are about to drop the column `bairro` on the `doadores` table. All the data in the column will be lost.
  - You are about to drop the column `endereco` on the `doadores` table. All the data in the column will be lost.
  - Added the required column `enderecoId` to the `coletas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "coletas" DROP COLUMN "endereco",
ADD COLUMN     "enderecoId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "doadores" DROP COLUMN "bairro",
DROP COLUMN "endereco";

-- CreateTable
CREATE TABLE "enderecos" (
    "id" UUID NOT NULL,
    "doadorId" UUID NOT NULL,
    "apelido" TEXT,
    "rua" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enderecos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "enderecos" ADD CONSTRAINT "enderecos_doadorId_fkey" FOREIGN KEY ("doadorId") REFERENCES "doadores"("usuarioId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coletas" ADD CONSTRAINT "coletas_enderecoId_fkey" FOREIGN KEY ("enderecoId") REFERENCES "enderecos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
