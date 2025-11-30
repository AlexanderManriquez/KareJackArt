const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const cors = require('cors');
require('dotenv').config();

const app = express();

//Middlewares base
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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