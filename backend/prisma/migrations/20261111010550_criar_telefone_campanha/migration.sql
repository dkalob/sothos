-- CreateTable
CREATE TABLE "telefone_campanha" (
    "id" TEXT NOT NULL,
    "id_conta" TEXT NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "nome" VARCHAR(100),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telefone_campanha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "telefone_campanha_id_conta_idx" ON "telefone_campanha"("id_conta");

-- CreateIndex
CREATE UNIQUE INDEX "telefone_campanha_id_conta_numero_key" ON "telefone_campanha"("id_conta", "numero");

-- AddForeignKey
ALTER TABLE "telefone_campanha" ADD CONSTRAINT "telefone_campanha_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
