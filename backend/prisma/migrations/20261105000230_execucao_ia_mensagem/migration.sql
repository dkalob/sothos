-- AlterTable
ALTER TABLE "execucao_ia" ADD COLUMN     "id_mensagem" TEXT;

-- CreateIndex
CREATE INDEX "execucao_ia_id_mensagem_idx" ON "execucao_ia"("id_mensagem");

-- AddForeignKey
ALTER TABLE "execucao_ia" ADD CONSTRAINT "execucao_ia_id_mensagem_fkey" FOREIGN KEY ("id_mensagem") REFERENCES "mensagem_ia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
