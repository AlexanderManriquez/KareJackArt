const ArtworkService = require('../../services/artwork.service');
const { uploadBuffer } = require('../../config/cloudinary');

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

class ArtworkController {
  static async createArtwork(req, res) {
    try {
      console.log('createArtwork called, has file?', !!req.file, 'body keys:', Object.keys(req.body));
      console.log('Headers content-type:', req.headers['content-type']);
      const { title, description, dimensions, year, isFeatured } = req.body;

      // Handle image upload if file present
      let imageUrl = req.body.imageUrl || null;
      if (req.file && req.file.buffer) {
        const uploadRes = await uploadBuffer(req.file.buffer, 'artworks');
        imageUrl = uploadRes.secure_url;
      }

      if (!imageUrl) {
        return res.status(400).json({ error: 'La imagen es requerida' });
      }

      // Prepare slug
      let slug = req.body.slug && req.body.slug.trim() ? req.body.slug.trim() : slugify(title || req.body.title);

      const data = {
        title: title || req.body.title,
        description: description || req.body.description,
        dimensions: dimensions || req.body.dimensions,
        year: year ? Number(year) : null,
        imageUrl,
        isFeatured: isFeatured === 'on' || isFeatured === true || isFeatured === 'true',
        slug,
        createdBy: req.user && req.user.id ? req.user.id : null,
      };

      const artwork = await ArtworkService.createArtwork(data);

      console.log('Artwork created:', artwork.id);
      res.status(201).json(artwork);
    } catch (error) {
      console.error('createArtwork error:', error);
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

      const updates = Object.assign({}, req.body || {});

      // Handle possible file upload replacement
      if (req.file && req.file.buffer) {
        const uploadRes = await uploadBuffer(req.file.buffer, 'artworks');
        updates.imageUrl = uploadRes.secure_url;
      }

      await ArtworkService.updateArtwork(id, updates);

      const updatedArtwork = await ArtworkService.getArtworkById(id);

      res.json({ message: 'Obra actualizada correctamente', updated: updatedArtwork });
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

  static async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó archivo' });
      }

      const result = await uploadBuffer(req.file.buffer, 'artworks');

      return res.status(201).json({
        message: 'Imagen subida correctamente',
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ArtworkController;