// Testes de Integração - API Endpoints
// Testa os endpoints HTTP da aplicação

// Mock do Prisma Client (deve vir antes de qualquer import)
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('../../src/database/prisma', () => ({}));

const request = require('supertest');
const app = require('../../src/app');
const transferService = require('../../src/services/transfer.service');

// Mock do service para testes de integração sem banco
jest.mock('../../src/services/transfer.service');

describe('Transfer API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /transfer', () => {
    it('deve retornar 201 quando transferência é bem sucedida', async () => {
      // Arrange
      transferService.execute.mockResolvedValue({
        id: 1,
        value: 100,
        payer: { id: 1, name: 'João', newBalance: 900 },
        payee: { id: 2, name: 'Maria', newBalance: 300 },
        timestamp: new Date()
      });

      // Act
      const response = await request(app)
        .post('/transfer')
        .send({ value: 100, payer: 1, payee: 2 })
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Transferência realizada com sucesso!');
      expect(response.body.transfer.value).toBe(100);
    });

    it('deve retornar 400 quando campos obrigatórios faltam', async () => {
      const response = await request(app)
        .post('/transfer')
        .send({ value: 100 }) // Falta payer e payee
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('obrigatórios');
    });

    it('deve retornar 400 quando saldo é insuficiente', async () => {
      transferService.execute.mockRejectedValue({
        message: 'Saldo insuficiente',
        statusCode: 400,
        isOperational: true
      });

      const response = await request(app)
        .post('/transfer')
        .send({ value: 100, payer: 1, payee: 2 })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Saldo insuficiente');
    });
  });

  describe('GET /transfer', () => {
    it('deve listar todas as transferências', async () => {
      transferService.findAll.mockResolvedValue([
        { id: 1, value: 100, payerId: 1, payeeId: 2 },
        { id: 2, value: 200, payerId: 2, payeeId: 3 }
      ]);

      const response = await request(app).get('/transfer');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /health', () => {
    it('deve retornar status OK', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });
});
