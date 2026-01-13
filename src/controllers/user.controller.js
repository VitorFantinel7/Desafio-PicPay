// User Controller - Endpoints auxiliares para usuários
// Útil para testar e verificar os dados

const userRepository = require('../repositories/user.repository');

const userController = {
  // GET /users - Lista todos os usuários
  async findAll(req, res, next) {
    try {
      const users = await userRepository.findAll();
      return res.json(users);
    } catch (error) {
      next(error);
    }
  },

  // GET /users/:id - Busca um usuário específico
  async findById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userRepository.findById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Remove a senha da resposta por segurança
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
