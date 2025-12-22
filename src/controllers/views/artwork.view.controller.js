const ArtworkService = require('../../services/artwork.service');

class ArtworkViewController {
  static async renderGallery(req, res) {
    try {
      const artworks = await ArtworkService.getAllArtworks();
      // Convert Sequelize instances to plain objects so Handlebars can access properties safely
      const plain = artworks.map(a => (a && typeof a.toJSON === 'function') ? a.toJSON() : a);

      res.render('public/gallery', { artworks: plain, pageClass: 'gallery' });
    } catch (error) {
      res.status(500).render('error', { message: error.message });
    }
  }

  static async renderSingleArtwork(req, res) {
    try {
      const { slug } = req.params;
      const artwork = await ArtworkService.getArtworkBySlug(slug);

      if (!artwork) {
        return res.status(404).render('404', { message: 'Obra no encontrada' });
      }

      const plain = (artwork && typeof artwork.toJSON === 'function') ? artwork.toJSON() : artwork;
      res.render('public/artwork-detail', { artwork: plain, pageClass: 'artwork' });
    } catch (error) {
      res.status(500).render('error', { message: error.message });
    }
  }

  static async renderHome(req, res) {
    try {
      const featured = await ArtworkService.getFeaturedArtworks();
      const plain = featured.map(f => (f && typeof f.toJSON === 'function') ? f.toJSON() : f);
      res.render('public/home', { featured: plain, pageClass: 'home' });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
  }
}

module.exports = ArtworkViewController;