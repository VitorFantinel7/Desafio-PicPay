// Transfer Repository - Camada de acesso ao banco de dados
// Responsável por todas as operações de banco relacionadas a transferências

const prisma = require('../database/prisma');

const transferRepository = {
  // Cria uma transferência (usado dentro de transação)
  async create(data, tx = prisma) {
    return tx.transfer.create({
      data: {
        value: data.value,
        payerId: data.payerId,
        payeeId: data.payeeId
      }
    });
  },

  // Busca transferência por ID
  async findById(id) {
    return prisma.transfer.findUnique({
      where: { id: Number(id) },
      include: {
        payer: {
          select: { id: true, fullName: true, email: true }
        },
        payee: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });
  },

  // Lista todas as transferências
  async findAll() {
    return prisma.transfer.findMany({
      include: {
        payer: {
          select: { id: true, fullName: true }
        },
        payee: {
          select: { id: true, fullName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  // Executa a transferência dentro de uma transação
  // Isso garante que se algo der errado, tudo é revertido
  async executeTransfer(payerId, payeeId, value) {
    return prisma.$transaction(async (tx) => {
      // 1. Debita do pagador
      const payer = await tx.user.update({
        where: { id: payerId },
        data: {
          balance: { decrement: value }
        }
      });

      // 2. Credita no recebedor
      const payee = await tx.user.update({
        where: { id: payeeId },
        data: {
          balance: { increment: value }
        }
      });

      // 3. Registra a transferência
      const transfer = await tx.transfer.create({
        data: {
          value: value,
          payerId: payerId,
          payeeId: payeeId
        }
      });

      return { transfer, payer, payee };
    });
  }
};

module.exports = transferRepository;
