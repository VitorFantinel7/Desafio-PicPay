// Transfer Routes - Define os endpoints de transferência
const express = require('express');
const transferController = require('../controllers/transfer.controller');

const router = express.Router();

// POST /transfer - Realiza uma transferência
router.post('/', transferController.create);

// GET /transfer - Lista todas as transferências
router.get('/', transferController.findAll);

// GET /transfer/:id - Busca uma transferência específica
router.get('/:id', transferController.findById);

module.exports = router;
