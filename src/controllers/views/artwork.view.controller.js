const ArtworkService = require('../../services/artwork.service');

class ArtworkViewController {
  static async renderGallery(req, res) {
    try {
      const artworks = await ArtworkService.getAllArtworks();

      res.render('public/gallery', { artworks });
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

      res.render('public/artwork-detail', { artwork });
    } catch (error) {
      res.status(500).render('error', { message: error.message });
    }
  }

  static async renderHome(req, res) {
    try {
      const featured = await ArtworkService.getFeaturedArtworks();
      res.render('public/home', {featured});
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
  }
}

module.exports = ArtworkViewController;