/*
  Warnings:

  - A unique constraint covering the columns `[id_conta]` on the table `execucao_segmentacao` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_conta` to the `execucao_segmentacao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "execucao_segmentacao" ADD COLUMN     "id_conta" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "execucao_segmentacao_id_conta_key" ON "execucao_segmentacao"("id_conta");

-- AddForeignKey
ALTER TABLE "execucao_segmentacao" ADD CONSTRAINT "execucao_segmentacao_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
