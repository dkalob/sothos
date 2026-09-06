-- CreateEnum
CREATE TYPE "Plataforma" AS ENUM ('NUVEMSHOP', 'CSV');

-- CreateEnum
CREATE TYPE "StatusLoja" AS ENUM ('ATIVA', 'DESCONECTADA', 'ERRO');

-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('ADMIN', 'OPERADOR');

-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('PENDENTE', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO', 'DEVOLVIDO');

-- CreateEnum
CREATE TYPE "TipoSincronizacao" AS ENUM ('CARGA_INICIAL', 'INCREMENTAL', 'MANUAL');

-- CreateEnum
CREATE TYPE "StatusSincronizacao" AS ENUM ('EM_ANDAMENTO', 'CONCLUIDA', 'FALHA', 'PARCIAL');

-- CreateEnum
CREATE TYPE "StatusExecucaoSegmentacao" AS ENUM ('EM_ANDAMENTO', 'CONCLUIDA', 'FALHA');

-- CreateEnum
CREATE TYPE "TipoCampanha" AS ENUM ('EMAIL', 'WHATSAPP', 'POPUP');

-- CreateEnum
CREATE TYPE "StatusCampanha" AS ENUM ('RASCUNHO', 'AGENDADA', 'EM_EXECUCAO', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StatusExecucaoIa" AS ENUM ('SUCESSO', 'FALHA');

-- CreateTable
CREATE TABLE "conta" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "ramo" VARCHAR(80) NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" TEXT NOT NULL,
    "id_conta" TEXT NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "papel" "PapelUsuario" NOT NULL DEFAULT 'OPERADOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_login_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loja_conectada" (
    "id" TEXT NOT NULL,
    "id_conta" TEXT NOT NULL,
    "plataforma" "Plataforma" NOT NULL,
    "id_externo" VARCHAR(80),
    "nome" VARCHAR(120) NOT NULL,
    "dominio" VARCHAR(180),
    "moeda" CHAR(3) NOT NULL DEFAULT 'BRL',
    "fuso_horario" VARCHAR(60) NOT NULL DEFAULT 'America/Sao_Paulo',
    "credenciais" JSONB,
    "escopos" TEXT[],
    "status" "StatusLoja" NOT NULL DEFAULT 'ATIVA',
    "conectada_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_sincronizacao_em" TIMESTAMP(3),

    CONSTRAINT "loja_conectada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sincronizacao" (
    "id" TEXT NOT NULL,
    "id_loja" TEXT NOT NULL,
    "tipo" "TipoSincronizacao" NOT NULL,
    "status" "StatusSincronizacao" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "iniciada_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizada_em" TIMESTAMP(3),
    "clientes_processados" INTEGER NOT NULL DEFAULT 0,
    "produtos_processados" INTEGER NOT NULL DEFAULT 0,
    "pedidos_processados" INTEGER NOT NULL DEFAULT 0,
    "mensagem_erro" TEXT,

    CONSTRAINT "sincronizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" TEXT NOT NULL,
    "id_loja" TEXT NOT NULL,
    "id_externo" VARCHAR(80),
    "nome" VARCHAR(160) NOT NULL,
    "email" VARCHAR(180),
    "telefone" VARCHAR(30),
    "cidade" VARCHAR(120),
    "estado" CHAR(2),
    "aceita_marketing" BOOLEAN NOT NULL DEFAULT false,
    "criado_em_origem" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupo_cliente" (
    "id" TEXT NOT NULL,
    "id_loja" TEXT NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "descricao" VARCHAR(255),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupo_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_grupo" (
    "id_cliente" TEXT NOT NULL,
    "id_grupo" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_grupo_pkey" PRIMARY KEY ("id_cliente","id_grupo")
);

-- CreateTable
CREATE TABLE "produto" (
    "id" TEXT NOT NULL,
    "id_loja" TEXT NOT NULL,
    "id_externo" VARCHAR(80),
    "nome" VARCHAR(200) NOT NULL,
    "sku" VARCHAR(80),
    "categoria" VARCHAR(120),
    "preco_atual" DECIMAL(12,2),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em_origem" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido" (
    "id" TEXT NOT NULL,
    "id_loja" TEXT NOT NULL,
    "id_cliente" TEXT,
    "id_externo" VARCHAR(80),
    "numero" VARCHAR(40),
    "status" "StatusPedido" NOT NULL,
    "valor_produtos" DECIMAL(12,2) NOT NULL,
    "valor_frete" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "valor_desconto" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "valor_total" DECIMAL(12,2) NOT NULL,
    "moeda" CHAR(3) NOT NULL DEFAULT 'BRL',
    "realizado_em" TIMESTAMP(3) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_pedido" (
    "id" TEXT NOT NULL,
    "id_pedido" TEXT NOT NULL,
    "id_produto" TEXT,
    "nome_produto" VARCHAR(200) NOT NULL,
    "sku" VARCHAR(80),
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(12,2) NOT NULL,
    "valor_total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "item_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execucao_segmentacao" (
    "id" TEXT NOT NULL,
    "id_loja" TEXT NOT NULL,
    "status" "StatusExecucaoSegmentacao" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "periodo_inicio" TIMESTAMP(3) NOT NULL,
    "periodo_fim" TIMESTAMP(3) NOT NULL,
    "data_referencia" TIMESTAMP(3) NOT NULL,
    "k" INTEGER NOT NULL,
    "parametros" JSONB,
    "total_clientes" INTEGER,
    "iniciada_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizada_em" TIMESTAMP(3),
    "mensagem_erro" TEXT,

    CONSTRAINT "execucao_segmentacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segmento" (
    "id" TEXT NOT NULL,
    "id_execucao" TEXT NOT NULL,
    "cluster" INTEGER NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "descricao" VARCHAR(500),
    "tamanho" INTEGER NOT NULL DEFAULT 0,
    "centroide" JSONB,
    "recencia_media" DECIMAL(10,2),
    "frequencia_media" DECIMAL(10,2),
    "valor_monetario_medio" DECIMAL(12,2),

    CONSTRAINT "segmento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analise_rfm" (
    "id" TEXT NOT NULL,
    "id_execucao" TEXT NOT NULL,
    "id_cliente" TEXT NOT NULL,
    "id_segmento" TEXT,
    "recencia_dias" INTEGER NOT NULL,
    "frequencia" INTEGER NOT NULL,
    "valor_monetario" DECIMAL(12,2) NOT NULL,
    "score_r" INTEGER NOT NULL,
    "score_f" INTEGER NOT NULL,
    "score_m" INTEGER NOT NULL,
    "ticket_medio" DECIMAL(12,2),
    "clv" DECIMAL(12,2),
    "probabilidade_churn" DECIMAL(5,4),
    "calculado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analise_rfm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanha" (
    "id" TEXT NOT NULL,
    "id_loja" TEXT NOT NULL,
    "id_segmento" TEXT,
    "id_criado_por" TEXT,
    "id_aprovado_por" TEXT,
    "tipo" "TipoCampanha" NOT NULL,
    "status" "StatusCampanha" NOT NULL DEFAULT 'RASCUNHO',
    "titulo" VARCHAR(160) NOT NULL,
    "assunto" VARCHAR(200),
    "conteudo" TEXT,
    "agendada_para" TIMESTAMP(3),
    "aprovada_em" TIMESTAMP(3),
    "enviada_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campanha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanha_cliente" (
    "id_campanha" TEXT NOT NULL,
    "id_cliente" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campanha_cliente_pkey" PRIMARY KEY ("id_campanha","id_cliente")
);

-- CreateTable
CREATE TABLE "campanha_produto" (
    "id_campanha" TEXT NOT NULL,
    "id_produto" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campanha_produto_pkey" PRIMARY KEY ("id_campanha","id_produto")
);

-- CreateTable
CREATE TABLE "execucao_ia" (
    "id" TEXT NOT NULL,
    "id_campanha" TEXT,
    "provedor" VARCHAR(60) NOT NULL,
    "modelo_ia" VARCHAR(80) NOT NULL,
    "prompt" TEXT NOT NULL,
    "resposta" TEXT,
    "status" "StatusExecucaoIa" NOT NULL,
    "tokens_entrada" INTEGER,
    "tokens_saida" INTEGER,
    "duracao_ms" INTEGER,
    "mensagem_erro" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "execucao_ia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "usuario_id_conta_idx" ON "usuario"("id_conta");

-- CreateIndex
CREATE INDEX "loja_conectada_id_conta_idx" ON "loja_conectada"("id_conta");

-- CreateIndex
CREATE UNIQUE INDEX "loja_conectada_plataforma_id_externo_key" ON "loja_conectada"("plataforma", "id_externo");

-- CreateIndex
CREATE INDEX "sincronizacao_id_loja_iniciada_em_idx" ON "sincronizacao"("id_loja", "iniciada_em");

-- CreateIndex
CREATE INDEX "cliente_id_loja_email_idx" ON "cliente"("id_loja", "email");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_id_loja_id_externo_key" ON "cliente"("id_loja", "id_externo");

-- CreateIndex
CREATE UNIQUE INDEX "grupo_cliente_id_loja_nome_key" ON "grupo_cliente"("id_loja", "nome");

-- CreateIndex
CREATE INDEX "produto_id_loja_sku_idx" ON "produto"("id_loja", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "produto_id_loja_id_externo_key" ON "produto"("id_loja", "id_externo");

-- CreateIndex
CREATE INDEX "pedido_id_loja_id_cliente_realizado_em_idx" ON "pedido"("id_loja", "id_cliente", "realizado_em");

-- CreateIndex
CREATE INDEX "pedido_id_loja_status_realizado_em_idx" ON "pedido"("id_loja", "status", "realizado_em");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_id_loja_id_externo_key" ON "pedido"("id_loja", "id_externo");

-- CreateIndex
CREATE INDEX "item_pedido_id_pedido_idx" ON "item_pedido"("id_pedido");

-- CreateIndex
CREATE INDEX "item_pedido_id_produto_idx" ON "item_pedido"("id_produto");

-- CreateIndex
CREATE INDEX "execucao_segmentacao_id_loja_iniciada_em_idx" ON "execucao_segmentacao"("id_loja", "iniciada_em");

-- CreateIndex
CREATE UNIQUE INDEX "segmento_id_execucao_cluster_key" ON "segmento"("id_execucao", "cluster");

-- CreateIndex
CREATE INDEX "analise_rfm_id_segmento_idx" ON "analise_rfm"("id_segmento");

-- CreateIndex
CREATE INDEX "analise_rfm_id_cliente_idx" ON "analise_rfm"("id_cliente");

-- CreateIndex
CREATE UNIQUE INDEX "analise_rfm_id_execucao_id_cliente_key" ON "analise_rfm"("id_execucao", "id_cliente");

-- CreateIndex
CREATE INDEX "campanha_id_loja_status_idx" ON "campanha"("id_loja", "status");

-- CreateIndex
CREATE INDEX "execucao_ia_id_campanha_idx" ON "execucao_ia"("id_campanha");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loja_conectada" ADD CONSTRAINT "loja_conectada_id_conta_fkey" FOREIGN KEY ("id_conta") REFERENCES "conta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sincronizacao" ADD CONSTRAINT "sincronizacao_id_loja_fkey" FOREIGN KEY ("id_loja") REFERENCES "loja_conectada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_id_loja_fkey" FOREIGN KEY ("id_loja") REFERENCES "loja_conectada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_cliente" ADD CONSTRAINT "grupo_cliente_id_loja_fkey" FOREIGN KEY ("id_loja") REFERENCES "loja_conectada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_grupo" ADD CONSTRAINT "cliente_grupo_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_grupo" ADD CONSTRAINT "cliente_grupo_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "grupo_cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_id_loja_fkey" FOREIGN KEY ("id_loja") REFERENCES "loja_conectada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_id_loja_fkey" FOREIGN KEY ("id_loja") REFERENCES "loja_conectada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_pedido" ADD CONSTRAINT "item_pedido_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_pedido" ADD CONSTRAINT "item_pedido_id_produto_fkey" FOREIGN KEY ("id_produto") REFERENCES "produto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execucao_segmentacao" ADD CONSTRAINT "execucao_segmentacao_id_loja_fkey" FOREIGN KEY ("id_loja") REFERENCES "loja_conectada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segmento" ADD CONSTRAINT "segmento_id_execucao_fkey" FOREIGN KEY ("id_execucao") REFERENCES "execucao_segmentacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analise_rfm" ADD CONSTRAINT "analise_rfm_id_execucao_fkey" FOREIGN KEY ("id_execucao") REFERENCES "execucao_segmentacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analise_rfm" ADD CONSTRAINT "analise_rfm_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analise_rfm" ADD CONSTRAINT "analise_rfm_id_segmento_fkey" FOREIGN KEY ("id_segmento") REFERENCES "segmento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanha" ADD CONSTRAINT "campanha_id_loja_fkey" FOREIGN KEY ("id_loja") REFERENCES "loja_conectada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanha" ADD CONSTRAINT "campanha_id_segmento_fkey" FOREIGN KEY ("id_segmento") REFERENCES "segmento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanha" ADD CONSTRAINT "campanha_id_criado_por_fkey" FOREIGN KEY ("id_criado_por") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanha" ADD CONSTRAINT "campanha_id_aprovado_por_fkey" FOREIGN KEY ("id_aprovado_por") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanha_cliente" ADD CONSTRAINT "campanha_cliente_id_campanha_fkey" FOREIGN KEY ("id_campanha") REFERENCES "campanha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanha_cliente" ADD CONSTRAINT "campanha_cliente_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanha_produto" ADD CONSTRAINT "campanha_produto_id_campanha_fkey" FOREIGN KEY ("id_campanha") REFERENCES "campanha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanha_produto" ADD CONSTRAINT "campanha_produto_id_produto_fkey" FOREIGN KEY ("id_produto") REFERENCES "produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execucao_ia" ADD CONSTRAINT "execucao_ia_id_campanha_fkey" FOREIGN KEY ("id_campanha") REFERENCES "campanha"("id") ON DELETE SET NULL ON UPDATE CASCADE;
