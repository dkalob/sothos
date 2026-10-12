import { PrismaClient } from '@prisma/client';

const contaId = process.argv[2];
if (!contaId) {
  console.error('Uso: node --env-file=.env seed.mjs <contaId> [limpar]');
  process.exit(1);
}

const prisma = new PrismaClient();
const DIA = 24 * 60 * 60 * 1000;

// Modo limpeza: remove só o que o seed criou
if (process.argv[3] === 'limpar') {
  const p = await prisma.pedido.deleteMany({
    where: { contaId, numero: { startsWith: 'SEED-' } },
  });
  const c = await prisma.cliente.deleteMany({
    where: { contaId, email: { endsWith: '@teste-rfm.com' } },
  });
  console.log(`Removidos: ${p.count} pedidos, ${c.count} clientes`);
  await prisma.$disconnect();
  process.exit(0);
}

// [nome, quantidade de pedidos, valor de cada pedido, dias desde o último pedido]
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

const agora = Date.now();

for (const [nome, qtd, valor, dias] of clientes) {
  await prisma.cliente.create({
    data: {
      contaId,
      nome,
      email: `${nome.toLowerCase()}@teste-rfm.com`,
      telefone: '11999990000',
      pedidos: {
        create: Array.from({ length: qtd }, (_, k) => ({
          contaId,
          numero: `SEED-${nome}-${k + 1}`,
          status: 'PAGO',
          valorProdutos: valor,
          valorTotal: valor,
          // o último pedido fica a "dias" atrás, os outros 30 dias antes um do outro
          realizadoEm: new Date(agora - (dias + k * 30) * DIA),
        })),
      },
    },
  });
}

console.log('Seed concluído: 10 clientes, 55 pedidos PAGO');
await prisma.$disconnect();