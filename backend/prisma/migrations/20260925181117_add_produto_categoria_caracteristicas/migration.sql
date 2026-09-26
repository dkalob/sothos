/*
  Warnings:

  - You are about to drop the column `categoria` on the `produto` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoCaracteristica" AS ENUM ('TEXTO', 'NUMERO', 'BOOLEANO', 'OPCAO');

-- AlterTable
ALTER TABLE "produto" DROP COLUMN "categoria",
ADD COLUMN     "id_categoria" TEXT,
ADD COLUMN     "imagem" VARCHAR(1000);

-- CreateTable
CREATE TABLE "categoria_produto" (
    "id" TEXT NOT NULL,
    "id_conta" TEXT NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categoria_produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caracteristica_produto" (
    "id" TEXT NOT NULL,
    "id_conta" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "tipo" "TipoCaracteristica" NOT NULL DEFAULT 'TEXTO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caracteristica_produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caracteristica_opcao" (
    "id" TEXT NOT NULL,
    "id_caracteristica" TEXT NOT NULL,
    "valor" VARCHAR(150) NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "caracteristica_opcao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produto_caracteristica" (
    "id" TEXT NOT NULL,
    "id_produto" TEXT NOT NULL,
    "id_caracteristica" TEXT NOT NULL,
    "valor" VARCHAR(500) NOT NULL,

    CONSTRAINT "produto_caracteristica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "categoria_produto_id_conta_idx" ON "categoria_produto"("id_conta");

-- CreateIndex
CREATE UNIQUE INDEX "categoria_produto_id_conta_nome_key" ON "categoria_produto"("id_conta", "nome");

-- CreateIndex
CREATE INDEX "caracteristica_produto_id_conta_idx" ON "caracteristica_produto"("id_conta");

-- CreateIndex
CREATE UNIQUE INDEX "caracteristica_produto_id_conta_nome_key" ON "caracteristica_produto"("id_conta", "nome");

-- CreateIndex
CREATE INDEX "caracteristica_opcao_id_caracteristica_idx" ON "caracteristica_opcao"("id_caracteristica");

-- CreateIndex
CREATE UNIQUE INDEX "caracteristica_opcao_id_caracteristica_valor_key" ON "caracteristica_opcao"("id_caracteristica", "valor");

-- CreateIndex
CREATE INDEX "produto_caracteristica_id_produto_idx" ON "produto_caracteristica"("id_produto");

-- CreateIndex
CREATE INDEX "produto_caracteristica_id_caracteristica_idx" ON "produto_caracteristica"("id_caracteristica");

-- CreateIndex
CREATE UNIQUE INDEX "produto_caracteristica_id_produto_id_caracteristica_key" ON "produto_caracteristica"("id_produto", "id_caracteristica");

-- CreateIndex
CREATE INDEX "produto_id_categoria_idx" ON "produto"("id_categoria");

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categoria_produto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoria_produto" ADD CONSTRAINT "categoria_produto_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caracteristica_produto" ADD CONSTRAINT "caracteristica_produto_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caracteristica_opcao" ADD CONSTRAINT "caracteristica_opcao_id_caracteristica_fkey" FOREIGN KEY ("id_caracteristica") REFERENCES "caracteristica_produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_caracteristica" ADD CONSTRAINT "produto_caracteristica_id_produto_fkey" FOREIGN KEY ("id_produto") REFERENCES "produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_caracteristica" ADD CONSTRAINT "produto_caracteristica_id_caracteristica_fkey" FOREIGN KEY ("id_caracteristica") REFERENCES "caracteristica_produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
