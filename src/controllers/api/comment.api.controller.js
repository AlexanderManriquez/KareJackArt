const CommentService = require('../../services/comment.service');

class CommentController {
  static async createComment(req, res) {
    try {
      const comment = await CommentService.createComment(req.body);

      res.status(201).json({
        message: 'Comentario creado correctamente',
        comment,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getCommentsForArtwork(req, res) {
    try {
      const { artworkId } = req.params;
      const comments = await CommentService.getCommentsForArtwork(artworkId);

      res.json(comments);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getPendingComments(req, res) {
    try {
      const comments = await CommentService.getPendingComments();
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async approveComment(req, res) {
    try {
      const { id } = req.params;
      const { approved } = req.body;

      const updated = await CommentService.approveComment(id, approved);

      res.json({
        message: approved ? 'Comentario aprobado' : 'Comentario rechazado',
        updated,
      });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
  }

  static async deleteComment (req, res) {
    try {
      const { id } = req.params;
      await CommentService.deleteComment(id);

      res.json({ message: 'Comentario eliminado correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
  }
}

module.exports = CommentController;