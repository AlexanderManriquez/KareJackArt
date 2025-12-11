const jwt = require('jsonwebtoken');
const { User } = require('../models');

function getTokenFromCookies(cookieHeader, name = 'token') {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';').map(p => p.trim());
  for (const part of parts) {
    if (part.startsWith(name + '=')) {
      return decodeURIComponent(part.substring(name.length + 1));
    }
  }
  return null;
}

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    // Try to read token from cookies header (for browser navigation)
    token = getTokenFromCookies(req.headers.cookie || '', 'token');
  }

  if (!token) {
    return res.status(401).json({ error: 'No autorizado. No se proporcionó token de autenticación' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach decoded info to req.user (keeps id/role). Also fetch user to ensure exists.
    req.user = decoded;

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'No autorizado. Usuario no encontrado' });
    }

    // Optionally attach full user model
    req.currentUser = user;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'No autorizado. Token inválido o expirado' });
  }
};

module.exports = authMiddleware;