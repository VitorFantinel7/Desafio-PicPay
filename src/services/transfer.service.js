// Transfer Service - Lógica de negócio das transferências
// Orquestra todas as validações e operações de transferência

const userRepository = require('../repositories/user.repository');
const transferRepository = require('../repositories/transfer.repository');
const authorizationService = require('./authorization.service');
const notificationService = require('./notification.service');
const AppError = require('../errors/AppError');

const transferService = {
  async execute({ value, payerId, payeeId }) {
    // ========================================
    // 1. VALIDAÇÕES BÁSICAS
    // ========================================
    
    // Valor deve ser positivo
    if (!value || value <= 0) {
      throw new AppError('O valor da transferência deve ser maior que zero');
    }

    // Não pode transferir para si mesmo
    if (payerId === payeeId) {
      throw new AppError('Não é possível transferir para você mesmo');
    }

    // ========================================
    // 2. BUSCA OS USUÁRIOS
    // ========================================
    
    const payer = await userRepository.findById(payerId);
    if (!payer) {
      throw new AppError('Usuário pagador não encontrado', 404);
    }

    const payee = await userRepository.findById(payeeId);
    if (!payee) {
      throw new AppError('Usuário recebedor não encontrado', 404);
    }

    // ========================================
    // 3. VALIDA REGRAS DE NEGÓCIO
    // ========================================
    
    // Lojistas não podem enviar dinheiro
    if (payer.userType === 'MERCHANT') {
      throw new AppError('Lojistas não podem realizar transferências, apenas receber');
    }

    // Verifica se tem saldo suficiente
    const payerBalance = Number(payer.balance);
    if (payerBalance < value) {
      throw new AppError(
        `Saldo insuficiente. Saldo atual: R$ ${payerBalance.toFixed(2)}, ` +
        `Valor da transferência: R$ ${value.toFixed(2)}`
      );
    }

    // ========================================
    // 4. CONSULTA SERVIÇO AUTORIZADOR
    // ========================================
    
    await authorizationService.authorize();

    // ========================================
    // 5. EXECUTA A TRANSFERÊNCIA (TRANSACIONAL)
    // ========================================
    
    const result = await transferRepository.executeTransfer(
      payerId,
      payeeId,
      value
    );

    // ========================================
    // 6. ENVIA NOTIFICAÇÃO (ASSÍNCRONA)
    // ========================================
    
    // Não bloqueia a resposta - roda em background
    notificationService.notifyTransferReceived(
      payee,
      value,
      payer.fullName
    ).catch(err => {
      console.error('Erro ao enviar notificação:', err.message);
    });

    // ========================================
    // 7. RETORNA O RESULTADO
    // ========================================
    
    return {
      id: result.transfer.id,
      value: Number(result.transfer.value),
      payer: {
        id: payer.id,
        name: payer.fullName,
        newBalance: Number(result.payer.balance)
      },
      payee: {
        id: payee.id,
        name: payee.fullName,
        newBalance: Number(result.payee.balance)
      },
      timestamp: result.transfer.createdAt
    };
  },

  // Lista todas as transferências
  async findAll() {
    return transferRepository.findAll();
  },

  // Busca uma transferência específica
  async findById(id) {
    const transfer = await transferRepository.findById(id);
    if (!transfer) {
      throw new AppError('Transferência não encontrada', 404);
    }
    return transfer;
  }
};

module.exports = transferService;
