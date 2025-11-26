const { Comment, Artwork } = require('../models');

class CommentService {
  static async createComment(data) {
    return await Comment.create(data);
  }

  static async getCommentsForArtwork(artworkId) {
    return await Comment.findAll({
      where: { artworkId },
      order: [['createdAt', 'DESC']],
    });
  }

  static async getPendingComments() {
    return await Comment.findAll({
      where: { isApproved: false },
      order: [['createdAt', 'ASC']],
    });
  }

  static async approveComment(id, approved = true) {
    return await Comment.update(
      { isApproved: approved },
      { 
        where: { id },
        returning: true,
      }
    );
  }

  static async getCommentById(id) {
    return await Comment.findByPk(id);
  }

  static async deleteComment(id) {
    return await Comment.destroy({ where: { id } });
  }
}

module.exports = CommentService;