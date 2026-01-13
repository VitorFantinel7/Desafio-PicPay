// Transfer Controller - Recebe e responde às requisições HTTP
// Responsável por validar entrada e chamar o service

const transferService = require('../services/transfer.service');

const transferController = {
  // POST /transfer - Realiza uma transferência
  async create(req, res, next) {
    try {
      const { value, payer, payee } = req.body;

      // Validação básica dos campos obrigatórios
      if (value === undefined || payer === undefined || payee === undefined) {
        return res.status(400).json({
          error: 'Campos obrigatórios: value, payer, payee'
        });
      }

      // Chama o service para executar a transferência
      const result = await transferService.execute({
        value: Number(value),
        payerId: Number(payer),
        payeeId: Number(payee)
      });

      // Retorna sucesso com os dados da transferência
      return res.status(201).json({
        message: 'Transferência realizada com sucesso!',
        transfer: result
      });

    } catch (error) {
      // Passa o erro para o middleware de erro
      next(error);
    }
  },

  // GET /transfer - Lista todas as transferências
  async findAll(req, res, next) {
    try {
      const transfers = await transferService.findAll();
      return res.json(transfers);
    } catch (error) {
      next(error);
    }
  },

  // GET /transfer/:id - Busca uma transferência específica
  async findById(req, res, next) {
    try {
      const { id } = req.params;
      const transfer = await transferService.findById(id);
      return res.json(transfer);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = transferController;
