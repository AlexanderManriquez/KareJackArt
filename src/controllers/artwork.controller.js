const ArtworkService = require('../services/artwork.service');

class ArtworkController {
  static async createArtwork(req, res) {
    try {
      const data = {
        ...req.body,
        createdBy: req.user.id,
      };

      const artwork = await ArtworkService.createArtwork(data);

      res.status(201).json(artwork);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAllArtworks(req, res) {
    try {
      const artworks = await ArtworkService.getAllArtworks();
      res.json(artworks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getFeaturedWorks(req, res) {
    try {
      const artworks = await ArtworkService.getFeaturedArtworks();
      res.json(artworks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getArtworkBySlug(req, res) {
    try {
      const { slug } = req.params;
      const artwork = await ArtworkService.getArtworkBySlug(slug);

      if (!artwork) return res.status(404).json({ error: 'Obra no encontrada' });

      res.json(artwork);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateArtwork(req, res) {
    try {
      const { id } = req.params;
      const updated = await ArtworkService.updateArtwork(id, req.body);

      res.json({
        message: 'Obra actualizada correctamente',
        updated,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteArtwork(req, res) {
    try {
      const { id } = req.params;
      await ArtworkService.deleteArtwork(id);
      res.json({ message: 'Obra eliminada correctamente' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = ArtworkController;