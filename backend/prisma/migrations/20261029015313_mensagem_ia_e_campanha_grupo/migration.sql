-- CreateEnum
CREATE TYPE "TomCampanha" AS ENUM ('FORMAL', 'DESCONTRAIDO', 'PERSUASIVO', 'DIVERTIDO', 'PESSOAL');

-- CreateEnum
CREATE TYPE "ObjetivoCampanha" AS ENUM ('LANCAMENTO', 'PROMOCAO', 'DIVULGACAO', 'INDICACAO', 'ULTIMAS_UNIDADES');

-- AlterTable
ALTER TABLE "campanha" ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "id_grupo" TEXT,
ADD COLUMN     "id_mensagem" TEXT;

-- CreateTable
CREATE TABLE "mensagem_ia" (
    "id" TEXT NOT NULL,
    "id_conta" TEXT NOT NULL,
    "id_produto" TEXT,
    "id_criado_por" TEXT,
    "tipo" "TipoCampanha" NOT NULL,
    "titulo" VARCHAR(160) NOT NULL,
    "tom" "TomCampanha" NOT NULL,
    "objetivo" "ObjetivoCampanha" NOT NULL,
    "observacoes" TEXT,
    "assunto" VARCHAR(200),
    "conteudo" TEXT NOT NULL,
    "imagem_url" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mensagem_ia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mensagem_ia_id_conta_tipo_idx" ON "mensagem_ia"("id_conta", "tipo");

-- AddForeignKey
ALTER TABLE "campanha" ADD CONSTRAINT "campanha_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "grupo_cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanha" ADD CONSTRAINT "campanha_id_mensagem_fkey" FOREIGN KEY ("id_mensagem") REFERENCES "mensagem_ia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagem_ia" ADD CONSTRAINT "mensagem_ia_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagem_ia" ADD CONSTRAINT "mensagem_ia_id_produto_fkey" FOREIGN KEY ("id_produto") REFERENCES "produto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagem_ia" ADD CONSTRAINT "mensagem_ia_id_criado_por_fkey" FOREIGN KEY ("id_criado_por") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
