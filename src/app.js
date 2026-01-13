// Configuração do Express
const express = require('express');

// Importa as rotas
const transferRoutes = require('./routes/transfer.routes');
const userRoutes = require('./routes/user.routes');

// Importa middleware de tratamento de erros
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares globais
app.use(express.json()); // Permite receber JSON no body das requisições

// Rota de health check (para verificar se a API está funcionando)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API PicPay Simplificado está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Registra as rotas
app.use('/transfer', transferRoutes);
app.use('/users', userRoutes);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Rota para URLs não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

module.exports = app;
