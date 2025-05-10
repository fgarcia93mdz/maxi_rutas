const express = require('express');
const router = express.Router();

const {
  login,
  logout,
 } = require('../controllers/autentificacion');

// Middleware de validaciones
const { validarLogin,
  validarCambiarContraseña
 } = require('../middlewares/validarDatos');
// Middleware de autenticación
const { authenticateToken } = require('../middlewares/authenticateToken');

// Login
router.post('/login', validarLogin, login);
// Logout
router.post('/logout', authenticateToken, logout);


module.exports = router;
