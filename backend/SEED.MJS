
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const contaId = process.argv[2];
const modo = process.argv[3];
const DIA = 24 * 60 * 60 * 1000;

if (!contaId) {
  console.error(
    'Uso: node --env-file=.env seed.mjs <contaId> [limpar]',
  );
  await prisma.$disconnect();
  process.exit(1);
}

// ============================================================
// CLIENTES
// [nome, quantidade de pedidos, valor de cada pedido,
//  dias desde o último pedido]
// ============================================================

const clientes = [
  ['Ana', 9, 120, 2],
  ['Bruno', 1, 80, 5],
  ['Carla', 7, 90, 15],
  ['Diego', 3, 150, 25],
  ['Elisa', 5, 60, 45],
  ['Fabio', 10, 200, 60],
  ['Gabi', 4, 70, 100],
  ['Hugo', 8, 110, 130],
  ['Iara', 2, 45, 200],
  ['Joao', 6, 130, 260],
];

// ============================================================
// PEDIDOS ADICIONAIS COM PRODUTOS
// Os valores abaixo são os SKUs reais do banco.
// ============================================================

const pedidosComProdutos = [
  { cliente: 'Ana', produtos: ['TEN-001', 'CAM-001'] },
  { cliente: 'Bruno', produtos: ['TEN-001', 'TEN-002'] },
  { cliente: 'Carla', produtos: ['TEN-002', 'CAM-001'] },
  { cliente: 'Diego', produtos: ['TEN-001', 'CAM-001', 'CAM-002'] },
  { cliente: 'Elisa', produtos: ['CAM-002'] },
  { cliente: 'Fabio', produtos: ['CAM-001'] },
];

const agora = Date.now();

// ============================================================
// MODO LIMPEZA
// Remove pedidos e clientes criados pelo seed.
// Os itens são removidos em cascata pelo schema.
// ============================================================

if (modo === 'limpar') {
  try {
    const pedidos = await prisma.pedido.deleteMany({
      where: {
        contaId,
        numero: { startsWith: 'SEED-' },
      },
    });

    const clientesRemovidos = await prisma.cliente.deleteMany({
      where: {
        contaId,
        email: { endsWith: '@teste-rfm.com' },
      },
    });

    console.log(
      `Limpeza concluída: ${pedidos.count} pedidos e ${clientesRemovidos.count} clientes removidos.`,
    );
  } catch (error) {
    console.error('Erro ao limpar o seed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }

  process.exit(process.exitCode ?? 0);
}

// ============================================================
// EXECUÇÃO DO SEED
// ============================================================

try {
  // ----------------------------------------------------------
  // 1. Consolidar clientes duplicados do seed
  //
  // Mantém o primeiro cliente de cada e-mail e transfere seus
  // pedidos para ele antes de excluir os clientes duplicados.
  // ----------------------------------------------------------

  const clientesSeed = await prisma.cliente.findMany({
    where: {
      contaId,
      email: { endsWith: '@teste-rfm.com' },
    },
    orderBy: { criadoEm: 'asc' },
    include: { pedidos: true },
  });

  const clientesPorEmail = new Map();

  for (const cliente of clientesSeed) {
    const email = cliente.email.toLowerCase();

    if (!clientesPorEmail.has(email)) {
      clientesPorEmail.set(email, cliente);
      continue;
    }

    const clientePrincipal = clientesPorEmail.get(email);

    // Transfere pedidos dos duplicados para o cliente principal.
    await prisma.pedido.updateMany({
      where: { clienteId: cliente.id },
      data: { clienteId: clientePrincipal.id },
    });

    // Exclui somente o cadastro duplicado.
    await prisma.cliente.delete({
      where: { id: cliente.id },
    });

    console.log(`Cliente duplicado consolidado: ${cliente.email}`);
  }

  // ----------------------------------------------------------
  // 2. Criar clientes ausentes e pedidos originais ausentes
  // ----------------------------------------------------------

  for (const [nome, qtd, valor, dias] of clientes) {
    const email = `${nome.toLowerCase()}@teste-rfm.com`;

    let cliente = await prisma.cliente.findFirst({
      where: { contaId, email },
    });

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          contaId,
          nome,
          email,
          telefone: '11999990000',
        },
      });

      console.log(`Cliente criado: ${nome}`);
    }

    // Cria apenas os pedidos originais que ainda não existem.
    for (let k = 0; k < qtd; k++) {
      const numero = `SEED-${nome}-${k + 1}`;

      const pedidoExistente = await prisma.pedido.findFirst({
        where: { contaId, numero },
      });

      if (pedidoExistente) {
        continue;
      }

      await prisma.pedido.create({
        data: {
          contaId,
          clienteId: cliente.id,
          numero,
          status: 'PAGO',
          valorProdutos: valor,
          valorFrete: 0,
          valorDesconto: 0,
          valorTotal: valor,
          realizadoEm: new Date(
            agora - (dias + k * 30) * DIA,
          ),
        },
      });
    }
  }

  // ----------------------------------------------------------
  // 3. Validar produtos necessários
  // ----------------------------------------------------------

  const skusNecessarios = [
    ...new Set(
      pedidosComProdutos.flatMap((pedido) => pedido.produtos),
    ),
  ];

  const produtosEncontrados = await prisma.produto.findMany({
    where: {
      contaId,
      sku: { in: skusNecessarios },
      ativo: true,
    },
  });

  const produtosPorSku = new Map(
    produtosEncontrados.map((produto) => [produto.sku, produto]),
  );

  const skusFaltantes = skusNecessarios.filter(
    (sku) => !produtosPorSku.has(sku),
  );

  if (skusFaltantes.length > 0) {
    throw new Error(
      `Produtos não encontrados ou inativos: ${skusFaltantes.join(', ')}`,
    );
  }

  const semPreco = produtosEncontrados
    .filter((produto) => produto.precoAtual == null)
    .map((produto) => produto.sku);

  if (semPreco.length > 0) {
    throw new Error(
      `Produtos sem preço cadastrado: ${semPreco.join(', ')}`,
    );
  }

  // ----------------------------------------------------------
  // 4. Criar os 6 pedidos com produtos
  // ----------------------------------------------------------

  for (const config of pedidosComProdutos) {
    const email = `${config.cliente.toLowerCase()}@teste-rfm.com`;

    const cliente = await prisma.cliente.findFirst({
      where: { contaId, email },
    });

    if (!cliente) {
      throw new Error(`Cliente não encontrado: ${config.cliente}`);
    }

    const numero = `SEED-PROD-${config.cliente}`;

    const pedidoExistente = await prisma.pedido.findFirst({
      where: { contaId, numero },
    });

    if (pedidoExistente) {
      // Não duplica pedidos já criados.
      continue;
    }

    const itens = config.produtos.map((sku) => {
      const produto = produtosPorSku.get(sku);
      const precoUnitario = Number(produto.precoAtual);

      return {
        produtoId: produto.id,
        nomeProduto: produto.nome,
        sku: produto.sku,
        quantidade: 1,
        precoUnitario,
        valorTotal: precoUnitario,
      };
    });

    // Calcula em centavos para evitar erros de ponto flutuante.
    const valorCentavos = itens.reduce(
      (total, item) =>
        total + Math.round(item.precoUnitario * 100),
      0,
    );

    const valorProdutos = valorCentavos / 100;

    await prisma.pedido.create({
      data: {
        contaId,
        clienteId: cliente.id,
        numero,
        status: 'PAGO',
        valorProdutos,
        valorFrete: 0,
        valorDesconto: 0,
        valorTotal: valorProdutos,
        realizadoEm: new Date(agora - DIA),
        itens: {
          create: itens,
        },
      },
    });

    console.log(
      `Pedido criado: ${config.cliente} | ${config.produtos.join(', ')} | R$ ${valorProdutos.toFixed(2)}`,
    );
  }

  // ----------------------------------------------------------
  // 5. Resumo final
  // ----------------------------------------------------------

  const totalClientes = await prisma.cliente.count({
    where: {
      contaId,
      email: { endsWith: '@teste-rfm.com' },
    },
  });

  const totalPedidos = await prisma.pedido.count({
    where: {
      contaId,
      numero: { startsWith: 'SEED-' },
    },
  });

  console.log('\nSeed concluído!');
  console.log(`Clientes de teste: ${totalClientes}`);
  console.log(`Pedidos de teste: ${totalPedidos}`);
  console.log('Esperado: 10 clientes e 61 pedidos.');
} catch (error) {
  console.error('\nErro ao executar o seed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
