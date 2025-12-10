const ArtworkViewController = require('./views/artwork.view.controller');

const ViewController = {
  home: (req, res) => ArtworkViewController.renderHome(req, res),
  gallery: (req, res) => ArtworkViewController.renderGallery(req, res),
  artworkDetail: (req, res) => ArtworkViewController.renderSingleArtwork(req, res),

  // Auth views (simple renders — templates should exist under views/)
  login: (req, res) => res.render('auth/login'),
  register: (req, res) => res.render('auth/register'),

  // User profile
  userProfile: (req, res) => res.render('user/profile'),

  // Admin views
  adminDashboard: (req, res) => res.render('admin/dashboard'),
  adminArtworks: (req, res) => res.render('admin/artworks'),
  adminComments: (req, res) => res.render('admin/comments'),
  adminUsers: (req, res) => res.render('admin/users'),
};

module.exports = ViewController;
