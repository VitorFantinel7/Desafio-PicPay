// Prisma Client - Singleton
// Garante que existe apenas uma conexão com o banco de dados

const { PrismaClient } = require('@prisma/client');

// Cria uma única instância do Prisma
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

module.exports = prisma;
