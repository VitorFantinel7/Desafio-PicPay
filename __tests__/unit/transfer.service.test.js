// Testes Unitários - Transfer Service
// Testa a lógica de negócio isoladamente usando mocks

// Mock do Prisma Client (deve vir antes de qualquer import que use ele)
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({}))
}));

// Mock do database/prisma
jest.mock('../../src/database/prisma', () => ({}));

// Mock de todos os módulos externos
jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/repositories/transfer.repository');
jest.mock('../../src/services/authorization.service');
jest.mock('../../src/services/notification.service');

const transferService = require('../../src/services/transfer.service');
const userRepository = require('../../src/repositories/user.repository');
const transferRepository = require('../../src/repositories/transfer.repository');
const authorizationService = require('../../src/services/authorization.service');
const notificationService = require('../../src/services/notification.service');
const AppError = require('../../src/errors/AppError');

describe('TransferService', () => {
  // Dados de teste
  const mockCommonUser = {
    id: 1,
    fullName: 'João Silva',
    email: 'joao@email.com',
    balance: 1000,
    userType: 'COMMON'
  };

  const mockMerchant = {
    id: 2,
    fullName: 'Loja do Pedro',
    email: 'loja@email.com',
    balance: 500,
    userType: 'MERCHANT'
  };

  const mockPayee = {
    id: 3,
    fullName: 'Maria Santos',
    email: 'maria@email.com',
    balance: 200,
    userType: 'COMMON'
  };

  // Limpa os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
    authorizationService.authorize.mockResolvedValue(true);
    notificationService.notifyTransferReceived.mockResolvedValue(true);
  });

  describe('execute', () => {
    it('deve realizar uma transferência com sucesso', async () => {
      // Arrange (Preparação)
      userRepository.findById
        .mockResolvedValueOnce(mockCommonUser)  // Pagador
        .mockResolvedValueOnce(mockPayee);       // Recebedor

      transferRepository.executeTransfer.mockResolvedValue({
        transfer: { id: 1, value: 100, createdAt: new Date() },
        payer: { ...mockCommonUser, balance: 900 },
        payee: { ...mockPayee, balance: 300 }
      });

      // Act (Ação)
      const result = await transferService.execute({
        value: 100,
        payerId: 1,
        payeeId: 3
      });

      // Assert (Verificação)
      expect(result.value).toBe(100);
      expect(result.payer.newBalance).toBe(900);
      expect(result.payee.newBalance).toBe(300);
      expect(authorizationService.authorize).toHaveBeenCalled();
    });

    it('deve rejeitar transferência com valor zero ou negativo', async () => {
      await expect(
        transferService.execute({ value: 0, payerId: 1, payeeId: 2 })
      ).rejects.toThrow('O valor da transferência deve ser maior que zero');

      await expect(
        transferService.execute({ value: -100, payerId: 1, payeeId: 2 })
      ).rejects.toThrow('O valor da transferência deve ser maior que zero');
    });

    it('deve rejeitar transferência para si mesmo', async () => {
      await expect(
        transferService.execute({ value: 100, payerId: 1, payeeId: 1 })
      ).rejects.toThrow('Não é possível transferir para você mesmo');
    });

    it('deve rejeitar quando pagador não existe', async () => {
      userRepository.findById.mockResolvedValueOnce(null);

      await expect(
        transferService.execute({ value: 100, payerId: 999, payeeId: 2 })
      ).rejects.toThrow('Usuário pagador não encontrado');
    });

    it('deve rejeitar quando recebedor não existe', async () => {
      userRepository.findById
        .mockResolvedValueOnce(mockCommonUser)
        .mockResolvedValueOnce(null);

      await expect(
        transferService.execute({ value: 100, payerId: 1, payeeId: 999 })
      ).rejects.toThrow('Usuário recebedor não encontrado');
    });

    it('deve rejeitar transferência de lojista', async () => {
      userRepository.findById
        .mockResolvedValueOnce(mockMerchant)  // Lojista como pagador
        .mockResolvedValueOnce(mockPayee);

      await expect(
        transferService.execute({ value: 100, payerId: 2, payeeId: 3 })
      ).rejects.toThrow('Lojistas não podem realizar transferências');
    });

    it('deve rejeitar quando saldo é insuficiente', async () => {
      userRepository.findById
        .mockResolvedValueOnce({ ...mockCommonUser, balance: 50 })
        .mockResolvedValueOnce(mockPayee);

      await expect(
        transferService.execute({ value: 100, payerId: 1, payeeId: 3 })
      ).rejects.toThrow('Saldo insuficiente');
    });

    it('deve rejeitar quando autorizador nega', async () => {
      userRepository.findById
        .mockResolvedValueOnce(mockCommonUser)
        .mockResolvedValueOnce(mockPayee);
      
      authorizationService.authorize.mockRejectedValue(
        new AppError('Transferência não autorizada', 403)
      );

      await expect(
        transferService.execute({ value: 100, payerId: 1, payeeId: 3 })
      ).rejects.toThrow('Transferência não autorizada');
    });

    it('deve completar transferência mesmo se notificação falhar', async () => {
      userRepository.findById
        .mockResolvedValueOnce(mockCommonUser)
        .mockResolvedValueOnce(mockPayee);

      transferRepository.executeTransfer.mockResolvedValue({
        transfer: { id: 1, value: 100, createdAt: new Date() },
        payer: { ...mockCommonUser, balance: 900 },
        payee: { ...mockPayee, balance: 300 }
      });

      // Notificação falha
      notificationService.notifyTransferReceived.mockRejectedValue(
        new Error('Serviço indisponível')
      );

      // Transferência deve completar mesmo assim
      const result = await transferService.execute({
        value: 100,
        payerId: 1,
        payeeId: 3
      });

      expect(result.value).toBe(100);
    });
  });
});
