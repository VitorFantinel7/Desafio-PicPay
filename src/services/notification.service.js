// Notification Service - Envia notificações aos usuários
// Simula envio de email/SMS após uma transferência

const axios = require('axios');

const notificationService = {
  async notify(user, message) {
    try {
      await axios.post(process.env.NOTIFICATION_URL, {
        email: user.email,
        message: message
      }, {
        timeout: 5000
      });

      console.log(`✉️  Notificação enviada para ${user.email}`);
      return true;

    } catch (error) {
      // Notificação é assíncrona e não deve bloquear a transferência
      // Se falhar, apenas loga o erro
      console.error(`⚠️  Falha ao enviar notificação para ${user.email}:`, error.message);
      
      // Retorna false mas não lança erro
      // A transferência já foi concluída, notificação é secundária
      return false;
    }
  },

  // Notifica o recebedor sobre uma transferência recebida
  async notifyTransferReceived(payee, value, payerName) {
    const message = `Você recebeu uma transferência de R$ ${value.toFixed(2)} de ${payerName}`;
    return this.notify(payee, message);
  }
};

module.exports = notificationService;
