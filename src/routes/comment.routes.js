const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/api/comment.api.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

//Rutas públicas
router.get('/artwork/:artworkId', CommentController.getCommentsForArtwork);
router.post('/', CommentController.createComment);

//Rutas protegidas
router.get('/pending', authMiddleware, adminMiddleware, CommentController.getPendingComments);
router.put('/:id/approve', authMiddleware, adminMiddleware, CommentController.approveComment);
router.delete('/:id', authMiddleware, adminMiddleware, CommentController.deleteComment);

module.exports = router;