const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

//Rutas de autenticación
router.post('/register', AuthController.register);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/login', AuthController.login);
router.post('/reset-password/request', AuthController.requestPasswordReset);
router.post('/reset-password/:token', AuthController.resetPassword);

module.exports = router;