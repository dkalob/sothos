/*
  Warnings:

  - You are about to drop the column `imagem_url` on the `mensagem_ia` table. All the data in the column will be lost.
  - You are about to drop the column `imagem_gerada` on the `produto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "execucao_ia" ADD COLUMN     "id_arte" TEXT;

-- AlterTable
ALTER TABLE "mensagem_ia" DROP COLUMN "imagem_url",
ADD COLUMN     "id_arte" TEXT;

-- AlterTable
ALTER TABLE "produto" DROP COLUMN "imagem_gerada";

-- CreateTable
CREATE TABLE "arte_ia" (
    "id" TEXT NOT NULL,
    "imagem_url" VARCHAR(1000) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arte_ia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "execucao_ia_id_arte_idx" ON "execucao_ia"("id_arte");

-- AddForeignKey
ALTER TABLE "mensagem_ia" ADD CONSTRAINT "mensagem_ia_id_arte_fkey" FOREIGN KEY ("id_arte") REFERENCES "arte_ia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execucao_ia" ADD CONSTRAINT "execucao_ia_id_arte_fkey" FOREIGN KEY ("id_arte") REFERENCES "arte_ia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
