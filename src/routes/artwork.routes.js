const express = require('express');
const router = express.Router();
const ArtworkController = require('../controllers/api/artwork.api.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { createArtworkValidators, updateArtworkValidators } = require('../validators/artwork.validator');

//Rutas públicas

router.get('/', ArtworkController.getAllArtworks);
router.get('/featured', ArtworkController.getFeaturedWorks);
router.get('/:slug', ArtworkController.getArtworkBySlug);

//Rutas protegidas
// Endpoint para subir imagenes (multipart/form-data, campo `image`) y crear la obra en una sola petición
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createArtworkValidators, validateRequest, ArtworkController.createArtwork);

// Legacy: endpoint separado de upload (si se quiere subir solo la imagen)
router.post('/upload', authMiddleware, adminMiddleware, upload.single('image'), ArtworkController.uploadImage);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateArtworkValidators, validateRequest, ArtworkController.updateArtwork);
router.delete('/:id', authMiddleware, adminMiddleware, ArtworkController.deleteArtwork);

module.exports = router;