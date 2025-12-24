const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/api/auth.api.controller');
const rateLimiter = require('../middlewares/rateLimiter');

//Rutas de autenticación
router.post('/register', rateLimiter, AuthController.register);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/login', rateLimiter, AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/reset-password/request', rateLimiter, AuthController.requestPasswordReset);
router.post('/reset-password/:token', AuthController.resetPassword);

module.exports = router;