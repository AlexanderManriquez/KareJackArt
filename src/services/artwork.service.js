const { Artwork, User, Comment } = require('../models');

class ArtworkService {
  static async createArtwork(data) {
    return await Artwork.create(data);
  }

  static async getArtworkById(id) {
    return await Artwork.findByPk(id, {
      include: [User, Comment],
    });
  }

  static async getArtworkBySlug(slug) {
    return await Artwork.findOne({
      where: { slug },
      include: [User, Comment],
    });
  }

  static async getAllArtworks() {
    return await Artwork.findAll({
      order: [['createdAt', 'DESC']],
      include: [User],
    });
  }

  static async getFeaturedArtworks() {
    return await Artwork.findAll({ where: { isFeatured: true } });
  }

  static async updateArtwork(id, updates) {
    return await Artwork.update(updates, {
      where: { id },
      returning: true,
    });
  }

  static async deleteArtwork(id) {
    return await Artwork.destroy({ where: { id } });
  }
}

module.exports = ArtworkService;