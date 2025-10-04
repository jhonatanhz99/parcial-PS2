const express = require('express');
const router = express.Router();

// Importamos las funciones directamente
const { login, registrar } = require('../controllers/authController');

// Definimos las rutas
router.post('/login', login);
router.post('/register', registrar);

module.exports = router;
