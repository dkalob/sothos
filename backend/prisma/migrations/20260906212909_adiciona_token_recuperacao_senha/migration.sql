-- CreateTable
CREATE TABLE "token_recuperacao_senha" (
    "id" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "usado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_recuperacao_senha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_recuperacao_senha_token_hash_key" ON "token_recuperacao_senha"("token_hash");

-- CreateIndex
CREATE INDEX "token_recuperacao_senha_id_usuario_idx" ON "token_recuperacao_senha"("id_usuario");

-- AddForeignKey
ALTER TABLE "token_recuperacao_senha" ADD CONSTRAINT "token_recuperacao_senha_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
