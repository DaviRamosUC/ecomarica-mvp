-- CreateTable
CREATE TABLE "banners" (
    "id" UUID NOT NULL,
    "imagemUrl" TEXT NOT NULL,
    "titulo" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);
