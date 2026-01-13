// User Routes - Define os endpoints de usuários
const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();

// GET /users - Lista todos os usuários
router.get('/', userController.findAll);

// GET /users/:id - Busca um usuário específico
router.get('/:id', userController.findById);

module.exports = router;
