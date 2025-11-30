const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

//Rutas para la gestión de usuarios
router.get('/me', authMiddleware, UserController.getProfile);
router.put('/me', authMiddleware, UserController.updateProfile);
router.get('/admin/users', authMiddleware, adminMiddleware, UserController.getAllUsers);
router.delete('/admin/users/:id', authMiddleware, adminMiddleware, UserController.deleteUser);

module.exports = router;