/*
  Warnings:

  - Added the required column `id_conta` to the `campanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_conta` to the `cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_conta` to the `grupo_cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_conta` to the `pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_conta` to the `produto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "campanha" ADD COLUMN     "id_conta" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "cliente" ADD COLUMN     "id_conta" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "grupo_cliente" ADD COLUMN     "id_conta" TEXT NOT NULL,
ALTER COLUMN "id_loja" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pedido" ADD COLUMN     "id_conta" TEXT NOT NULL,
ALTER COLUMN "id_loja" DROP NOT NULL;

-- AlterTable
ALTER TABLE "produto" ADD COLUMN     "id_conta" TEXT NOT NULL,
ALTER COLUMN "id_loja" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "campanha_id_conta_idx" ON "campanha"("id_conta");

-- CreateIndex
CREATE INDEX "cliente_id_conta_idx" ON "cliente"("id_conta");

-- CreateIndex
CREATE INDEX "grupo_cliente_id_conta_idx" ON "grupo_cliente"("id_conta");

-- CreateIndex
CREATE INDEX "pedido_id_conta_idx" ON "pedido"("id_conta");

-- CreateIndex
CREATE INDEX "produto_id_conta_idx" ON "produto"("id_conta");

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_cliente" ADD CONSTRAINT "grupo_cliente_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanha" ADD CONSTRAINT "campanha_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
