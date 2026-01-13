// Seed - Popula o banco de dados com dados iniciais para teste
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpa as tabelas (ordem importa por causa das foreign keys)
  await prisma.transfer.deleteMany();
  await prisma.user.deleteMany();

  // Cria usuários comuns
  const user1 = await prisma.user.create({
    data: {
      fullName: 'João Silva',
      document: '12345678901',        // CPF
      email: 'joao@email.com',
      password: 'senha123',           // Em produção, usar hash!
      balance: 1000.00,
      userType: 'COMMON',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      fullName: 'Maria Santos',
      document: '98765432101',
      email: 'maria@email.com',
      password: 'senha123',
      balance: 500.00,
      userType: 'COMMON',
    },
  });

  // Cria lojistas
  const merchant1 = await prisma.user.create({
    data: {
      fullName: 'Loja do Pedro',
      document: '12345678000199',     // CNPJ
      email: 'loja@email.com',
      password: 'senha123',
      balance: 2000.00,
      userType: 'MERCHANT',
    },
  });

  const merchant2 = await prisma.user.create({
    data: {
      fullName: 'Mercado da Ana',
      document: '98765432000188',
      email: 'mercado@email.com',
      password: 'senha123',
      balance: 5000.00,
      userType: 'MERCHANT',
    },
  });

  console.log('✅ Seed concluído!');
  console.log('Usuários criados:');
  console.log(`  - ${user1.fullName} (COMUM) - ID: ${user1.id} - Saldo: R$ ${user1.balance}`);
  console.log(`  - ${user2.fullName} (COMUM) - ID: ${user2.id} - Saldo: R$ ${user2.balance}`);
  console.log(`  - ${merchant1.fullName} (LOJISTA) - ID: ${merchant1.id} - Saldo: R$ ${merchant1.balance}`);
  console.log(`  - ${merchant2.fullName} (LOJISTA) - ID: ${merchant2.id} - Saldo: R$ ${merchant2.balance}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
