// User Repository - Camada de acesso ao banco de dados
// Responsável por todas as operações de banco relacionadas a usuários

const prisma = require('../database/prisma');

const userRepository = {
  // Busca usuário por ID
  async findById(id) {
    return prisma.user.findUnique({
      where: { id: Number(id) }
    });
  },

  // Busca usuário por email
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  },

  // Busca usuário por documento (CPF/CNPJ)
  async findByDocument(document) {
    return prisma.user.findUnique({
      where: { document }
    });
  },

  // Lista todos os usuários
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        document: true,
        balance: true,
        userType: true,
        createdAt: true
      }
    });
  },

  // Cria um novo usuário
  async create(data) {
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        document: data.document,
        email: data.email,
        password: data.password, // Em produção, usar hash!
        balance: data.balance || 0,
        userType: data.userType || 'COMMON'
      }
    });
  },

  // Atualiza o saldo do usuário
  async updateBalance(id, newBalance) {
    return prisma.user.update({
      where: { id: Number(id) },
      data: { balance: newBalance }
    });
  }
};

module.exports = userRepository;
