const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. No se proporcionó token de autenticación' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'No autorizado. Usuario no encontrado' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'No autorizado. Token inválido o expirado' });
  }
};

module.exports = authMiddleware;