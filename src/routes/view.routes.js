const express = require('express');
const router = express.Router();
const ViewController = require('../controllers/view.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

//Sitio público
router.get('/', ViewController.home);
router.get('/gallery', ViewController.gallery);
router.get('/about', ViewController.about);
router.get('/artwork/:slug', ViewController.artworkDetail);
//Autenticación
router.get('/login', ViewController.login);
router.get('/register', ViewController.register);
//Perfil de usuario (protegido)
router.get('/profile', authMiddleware, ViewController.userProfile);
//Panel de administración (protegido)
router.get('/admin/dashboard', authMiddleware, adminMiddleware, ViewController.adminDashboard);
router.get('/admin/artworks', authMiddleware, adminMiddleware, ViewController.adminArtworks);
router.get('/admin/comments', authMiddleware, adminMiddleware, ViewController.adminComments);
router.get('/admin/users', authMiddleware, adminMiddleware, ViewController.adminUsers);

module.exports = router;