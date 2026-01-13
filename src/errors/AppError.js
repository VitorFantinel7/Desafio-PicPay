// AppError - Classe de erro customizada
// Permite criar erros com código HTTP específico

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Diferencia erros esperados de bugs

    // Captura o stack trace para debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
