class ViewController {
  static home(req, res) {
    res.render('home');
  }

  static gallery(req, res) {
    res.render('gallery');
  }

  static artworkDetail(req, res) {
    res.render('artwork-detail', { slug: req.params.slug });
  }

  static login(req, res) {
    res.render('login');
  }

  static register(req, res) {
    res.render('register');
  }

  static userProfile(req, res) {
    res.render('profile')
  }

  static adminDashboard(req, res) {
    res.render('admin/dashboard');
  }

  static adminArtworks(req, res) {
    res.render('admin/artworks');
  }

  static adminComments(req, res) {
    res.render('admin/comments');
  }

  static adminUsers(req, res) {
    res.render('admin/users');
  }
}

module.exports = ViewController;