const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');

const app = express();

//Middlewares base
// Basic security headers with a permissive CSP that allows known CDNs and local assets
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https:'],
  styleSrcElem: ["'self'", 'https://fonts.googleapis.com', 'https:'],
  fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https:'],
  imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https:'],
  connectSrc: ["'self'"],
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: cspDirectives,
  },
}));

// CORS: allow a configured origin in production, otherwise default to permissive for dev
const corsOrigin = process.env.CORS_ORIGIN || false;
if (corsOrigin) {
  app.use(cors({ origin: corsOrigin, credentials: true }));
} else {
  app.use(cors());
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make current year available to all views to avoid unsafe client-side replacements
app.use((req, res, next) => {
  res.locals.year = new Date().getFullYear();
  next();
});

// Populate current user (if any) into res.locals so templates can render auth state safely
const jwt = require('jsonwebtoken');
const { User } = require('./models');
const crypto = require('crypto');
app.use(async (req, res, next) => {
  try {
    const cookieHeader = req.headers.cookie || '';
    const match = cookieHeader.split(';').map(p=>p.trim()).find(p=>p.startsWith('token='));
    if (!match) return next();
    const token = decodeURIComponent(match.split('=')[1]);
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) return next();
    const user = await User.findByPk(decoded.id);
    if (!user) return next();
    const userJson = user.toJSON ? user.toJSON() : user;

    // add helper flags and avatar URL (prefer stored avatarUrl, fallback to gravatar)
    userJson.isAdmin = userJson.role === 'admin';
    try {
      if (userJson.avatarUrl) {
        // already stored (uploaded) avatar URL
      } else {
        const email = (userJson.email || '').trim().toLowerCase();
        const hash = crypto.createHash('md5').update(email).digest('hex');
        userJson.avatarUrl = `https://www.gravatar.com/avatar/${hash}?s=64&d=identicon`;
      }
    } catch (err) {
      userJson.avatarUrl = '/images/avatar-default.png';
    }

    res.locals.currentUser = userJson;
    req.currentUser = user;
    req.user = user;
    next();
  } catch (e) {
    // don't break requests if token invalid; just continue unauthenticated
    next();
  }
});

//Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

//Rutas para vistas del Frontend
const viewRoutes = require('./routes/view.routes');
app.use('/', viewRoutes);

//Rutas para la API del Backend
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/artworks', require('./routes/artwork.routes'));
app.use('/api/comments', require('./routes/comment.routes'));
app.use('/api/users', require('./routes/user.routes'));

//Carpeta de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

//Arranque del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

module.exports = app;