const { body } = require('express-validator');

const createArtworkValidators = [
  body('title').trim().notEmpty().withMessage('El título es requerido').isLength({ max: 200 }).withMessage('Título muy largo'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 2000 }).withMessage('Descripción muy larga'),
  body('dimensions').optional({ checkFalsy: true }).isLength({ max: 100 }).withMessage('Dimensiones demasiado largas'),
  body('year').optional({ checkFalsy: true }).isInt({ min: 1000, max: 9999 }).withMessage('Año inválido'),
  body('slug').optional({ checkFalsy: true }).isSlug().withMessage('Slug inválido'),
  body('category').trim().notEmpty().withMessage('La categoría es requerida').isIn(['Retratos','Acuarelas','Puntillismo']).withMessage('Categoría inválida'),
];

const updateArtworkValidators = [
  body('title').optional({ checkFalsy: true }).trim().notEmpty().withMessage('El título no puede estar vacío').isLength({ max: 200 }).withMessage('Título muy largo'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 2000 }).withMessage('Descripción muy larga'),
  body('dimensions').optional({ checkFalsy: true }).isLength({ max: 100 }).withMessage('Dimensiones demasiado largas'),
  body('year').optional({ checkFalsy: true }).isInt({ min: 1000, max: 9999 }).withMessage('Año inválido'),
  body('slug').optional({ checkFalsy: true }).isSlug().withMessage('Slug inválido'),
  body('category').optional({ checkFalsy: true }).trim().isIn(['Retratos','Acuarelas','Puntillismo']).withMessage('Categoría inválida'),
];

module.exports = {
  createArtworkValidators,
  updateArtworkValidators,
};
