const { Router } = require('express');
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

module.exports = (container) => {
  const router = Router();
  const ctrl = container.temporadaController;

  router.get('/', (req, res, next) => ctrl.findAll(req, res, next));

  router.post(
    '/',
    [
      body('nombre').notEmpty().withMessage('nombre es requerido'),
      body('fecha_inicio').isISO8601().withMessage('fecha_inicio debe ser una fecha ISO válida'),
      body('fecha_fin').isISO8601().withMessage('fecha_fin debe ser una fecha ISO válida')
    ],
    validate,
    (req, res, next) => ctrl.create(req, res, next)
  );

  router.get('/activa', (req, res, next) => ctrl.findActiva(req, res, next));

  router.post(
    '/:id/cerrar',
    [param('id').isInt({ min: 1 }).withMessage('id debe ser un entero positivo')],
    validate,
    (req, res, next) => ctrl.cerrar(req, res, next)
  );

  return router;
};
