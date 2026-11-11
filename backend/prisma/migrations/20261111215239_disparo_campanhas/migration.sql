-- CreateEnum
CREATE TYPE "StatusEnvio" AS ENUM ('PENDENTE', 'ENVIADO', 'FALHA');

-- AlterTable
ALTER TABLE "campanha" ADD COLUMN     "id_telefone" TEXT;

-- AlterTable
ALTER TABLE "campanha_cliente" ADD COLUMN     "enviado_em" TIMESTAMP(3),
ADD COLUMN     "erro" VARCHAR(500),
ADD COLUMN     "status" "StatusEnvio" NOT NULL DEFAULT 'PENDENTE';

-- CreateIndex
CREATE INDEX "campanha_cliente_id_campanha_status_idx" ON "campanha_cliente"("id_campanha", "status");

-- AddForeignKey
ALTER TABLE "campanha" ADD CONSTRAINT "campanha_id_telefone_fkey" FOREIGN KEY ("id_telefone") REFERENCES "telefone_campanha"("id") ON DELETE SET NULL ON UPDATE CASCADE;
