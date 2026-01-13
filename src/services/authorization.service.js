// Authorization Service - Consulta o serviço autorizador externo
// Simula a consulta a um antifraude ou sistema de autorização

const axios = require('axios');
const AppError = require('../errors/AppError');

const authorizationService = {
  async authorize() {
    try {
      const response = await axios.get(process.env.AUTHORIZER_URL, {
        timeout: 5000 // Timeout de 5 segundos
      });

      // Verifica se a resposta indica autorização
      // O mock retorna: { "status": "success", "data": { "authorization": true } }
      const { data } = response.data;
      
      if (data?.authorization === true) {
        return true;
      }

      throw new AppError('Transferência não autorizada pelo serviço autorizador', 403);
      
    } catch (error) {
      // Se for um AppError nosso, repassa
      if (error instanceof AppError) {
        throw error;
      }

      // Se for erro de conexão ou timeout
      if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
        throw new AppError('Serviço autorizador indisponível. Tente novamente.', 503);
      }

      // Erro genérico
      throw new AppError('Erro ao consultar serviço autorizador', 500);
    }
  }
};

module.exports = authorizationService;
