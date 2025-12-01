const express = require('express');
const router = express.Router();
const ArtworkController = require('../controllers/api/artwork.api.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

//Rutas públicas

router.get('/', ArtworkController.getAllArtworks);
router.get('/featured', ArtworkController.getFeaturedWorks);
router.get('/:slug', ArtworkController.getArtworkBySlug);

//Rutas protegidas

router.post('/', authMiddleware, adminMiddleware, ArtworkController.createArtwork);
router.put('/:id', authMiddleware, adminMiddleware, ArtworkController.updateArtwork);
router.delete('/:id', authMiddleware, adminMiddleware, ArtworkController.deleteArtwork);

module.exports = router;