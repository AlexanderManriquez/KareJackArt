module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    const isAjax = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest' || (req.get('Accept') && req.get('Accept').includes('application/json'));
    if (isAjax) return res.status(403).json({ error: 'Acceso denegado, solo administradores' });
    return res.status(403).render('auth/access-denied');
  }
  next();
};