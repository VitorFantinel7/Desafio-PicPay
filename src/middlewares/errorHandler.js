// Middleware de Tratamento de Erros
// Captura todos os erros da aplicação e retorna uma resposta padronizada

const errorHandler = (err, req, res, next) => {
  // Log do erro para debugging
  console.error('❌ Erro:', err.message);
  
  // Se for um erro em desenvolvimento, mostra mais detalhes
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }

  // Se for um AppError (erro esperado)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Se for erro do Prisma (banco de dados)
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Registro duplicado. Verifique os dados informados.'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Registro não encontrado.'
    });
  }

  // Erro genérico (bug não esperado)
  return res.status(500).json({
    error: 'Erro interno do servidor. Tente novamente mais tarde.'
  });
};

module.exports = errorHandler;
